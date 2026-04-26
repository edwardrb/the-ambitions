import { processSignals } from './scout'
import { generateDailySentimentForAllUsers } from './market-sentiment'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UserSchedule {
  user_id: string
  last_run: string
  next_run: string
  is_active: boolean
}

class AgentScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private dailySentimentInterval: NodeJS.Timeout | null = null
  private isRunning = false

  // Start scheduling for all active users
  async startScheduler() {
    if (this.isRunning) {
      console.log('⚠️ Scheduler is already running')
      return
    }

    this.isRunning = true
    console.log('🚀 Starting Agent Scheduler...')

    // Fetch all users with preferences (active users)
    try {
      const { data: users, error } = await supabase
        .from('user_preferences')
        .select('user_id, created_at')

      if (error) {
        console.error('Error fetching users:', error)
        return
      }

      if (!users || users.length === 0) {
        console.log('📭 No users found with preferences')
        return
      }

      console.log(`👥 Found ${users.length} users to schedule`)

      // Start scheduling for each user
      for (const user of users) {
        this.scheduleUser(user.user_id)
      }

      // Start daily sentiment analysis (runs once per day at 9 AM)
      this.startDailySentimentSchedule()

    } catch (error) {
      console.error('Error starting scheduler:', error)
    }
  }

  // Schedule individual user
  private async scheduleUser(userId: string) {
    // Clear existing interval for this user if it exists
    if (this.intervals.has(userId)) {
      clearInterval(this.intervals.get(userId)!)
    }

    console.log(`⏰ Scheduling user: ${userId}`)

    // Run immediately, then set interval
    await this.runUserScout(userId)

    // Set 15-minute interval
    const interval = setInterval(async () => {
      await this.runUserScout(userId)
    }, 15 * 60 * 1000) // 15 minutes

    this.intervals.set(userId, interval)
  }

  // Run scout for individual user
  private async runUserScout(userId: string) {
    try {
      console.log(`🔍 Running scout for user: ${userId} at ${new Date().toISOString()}`)

      const result = await processSignals(userId)

      if (result.success) {
        console.log(`✅ User ${userId}: ${result.processed} signals processed, ${result.stats?.success_rate}% success rate`)
      } else {
        console.log(`❌ User ${userId}: Failed with ${result.errors.length} errors`)
      }

    } catch (error) {
      console.error(`❌ Error running scout for user ${userId}:`, error)
    }
  }

  // Start daily sentiment analysis schedule
  private startDailySentimentSchedule() {
    // Clear existing daily sentiment interval
    if (this.dailySentimentInterval) {
      clearInterval(this.dailySentimentInterval)
    }

    console.log('🌅 Starting daily sentiment analysis schedule')

    // Run immediately, then schedule for daily execution
    this.runDailySentimentAnalysis()

    // Schedule to run every 24 hours (86400000 ms)
    this.dailySentimentInterval = setInterval(async () => {
      await this.runDailySentimentAnalysis()
    }, 24 * 60 * 60 * 1000) // 24 hours
  }

  // Run daily sentiment analysis for all users
  private async runDailySentimentAnalysis() {
    try {
      console.log(`🧠 Running daily market sentiment analysis at ${new Date().toISOString()}`)

      const result = await generateDailySentimentForAllUsers()

      if (result.success) {
        console.log(`✅ Daily sentiment analysis completed: ${result.processed} users processed`)
      } else {
        console.log(`❌ Daily sentiment analysis failed with ${result.errors.length} errors`)
      }

    } catch (error) {
      console.error('❌ Error running daily sentiment analysis:', error)
    }
  }

  // Stop scheduling for specific user
  stopUserSchedule(userId: string) {
    if (this.intervals.has(userId)) {
      clearInterval(this.intervals.get(userId)!)
      this.intervals.delete(userId)
      console.log(`⏹️ Stopped scheduling for user: ${userId}`)
    }
  }

  // Stop all scheduling
  stopScheduler() {
    console.log('🛑 Stopping Agent Scheduler...')
    
    // Clear user intervals
    for (const [userId, interval] of this.intervals) {
      clearInterval(interval)
    }
    
    // Clear daily sentiment interval
    if (this.dailySentimentInterval) {
      clearInterval(this.dailySentimentInterval)
      this.dailySentimentInterval = null
    }
    
    this.intervals.clear()
    this.isRunning = false
    console.log('✅ Scheduler stopped')
  }

  // Get scheduler status
  getStatus() {
    return {
      is_running: this.isRunning,
      active_users: this.intervals.size,
      scheduled_users: Array.from(this.intervals.keys())
    }
  }

  // Add new user to schedule
  async addUserToSchedule(userId: string) {
    console.log(`➕ Adding user to schedule: ${userId}`)
    await this.scheduleUser(userId)
  }

  // Remove user from schedule
  removeUserFromSchedule(userId: string) {
    console.log(`➖ Removing user from schedule: ${userId}`)
    this.stopUserSchedule(userId)
  }
}

// Create singleton instance
const scheduler = new AgentScheduler()

// Export for use in API routes
export { scheduler }

// Auto-start scheduler in production or when explicitly called
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  scheduler.startScheduler()
}

// For local development, you can manually start it
export const startScheduler = () => scheduler.startScheduler()
export const stopScheduler = () => scheduler.stopScheduler()
export const addUserToSchedule = (userId: string) => scheduler.addUserToSchedule(userId)
export const removeUserFromSchedule = (userId: string) => scheduler.removeUserFromSchedule(userId)
