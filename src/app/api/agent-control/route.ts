import { NextRequest, NextResponse } from 'next/server'
import { scheduler } from '@/lib/agent/scheduler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, user_id } = body

    if (!action || !user_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing action or user_id' 
      }, { status: 400 })
    }

    console.log(`API: Agent control request - ${action} for user: ${user_id}`)

    switch (action) {
      case 'pause':
        // Stop scheduling for specific user
        scheduler.removeUserFromSchedule(user_id)
        console.log(`⏸️ Agent paused for user: ${user_id}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Agent paused successfully',
          status: 'paused'
        })

      case 'resume':
        // Add user back to schedule
        await scheduler.addUserToSchedule(user_id)
        console.log(`▶️ Agent resumed for user: ${user_id}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Agent resumed successfully',
          status: 'active'
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Use "pause" or "resume"' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('API: Error in agent control route:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const status = scheduler.getStatus()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agent control API endpoint. Use POST to pause/resume agent.',
      scheduler_status: status,
      endpoints: {
        POST: {
          description: 'Control agent activity',
          actions: {
            pause: 'Stop agent scheduling for user',
            resume: 'Resume agent scheduling for user'
          },
          body: {
            action: 'pause | resume',
            user_id: 'string'
          }
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'API endpoint error'
    }, { status: 500 })
  }
}
