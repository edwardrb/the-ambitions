import { NextRequest, NextResponse } from 'next/server'
import { processSignals } from '@/lib/agent/scout'
import { scheduler } from '@/lib/agent/scheduler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.user_id
    
    console.log(`API: Signal scouting process started for user: ${userId || 'anonymous'}`)
    
    const result = await processSignals(userId)
    
    if (result.success) {
      console.log(`API: Signal scouting process completed { success: true, processed: ${result.processed}, errors: [] }`)
      return NextResponse.json({ 
        success: true, 
        processed: result.processed, 
        errors: result.errors,
        stats: result.stats
      })
    } else {
      console.log(`API: Signal scouting process completed { success: false, processed: ${result.processed}, errors: ${result.errors} }`)
      return NextResponse.json({ 
        success: false, 
        processed: result.processed, 
        errors: result.errors 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('API: Critical error in scout route:', error)
    return NextResponse.json({ 
      success: false, 
      processed: 0, 
      errors: ['Internal server error'] 
    }, { status: 500 })
  }
}

// GET endpoint for scheduler status
export async function GET() {
  try {
    const status = scheduler.getStatus()
    return NextResponse.json({ 
      success: true, 
      scheduler_status: status 
    })
  } catch (error) {
    console.error('API: Error getting scheduler status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get scheduler status' 
    }, { status: 500 })
  }
}
