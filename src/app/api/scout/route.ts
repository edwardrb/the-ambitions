import { NextRequest, NextResponse } from 'next/server'
import { processSignals } from '@/lib/agent/scout'
import { scheduler } from '@/lib/agent/scheduler'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 API: Scout POST request received')
    
    const body = await request.json()
    const userId = body.user_id
    
    console.log(`📊 API: Request body:`, body)
    console.log(`🚀 API: Signal scouting process started for user: ${userId || 'anonymous'}`)
    
    if (!userId) {
      console.error('❌ API: No user_id provided in request')
      return NextResponse.json({ 
        success: false, 
        processed: 0, 
        errors: ['Missing user_id in request'] 
      }, { status: 400 })
    }
    
    console.log('⚡ API: Calling processSignals function...')
    const result = await processSignals(userId)
    console.log('⚡ API: processSignals completed, result:', result)
    
    if (result.success) {
      console.log(`✅ API: Signal scouting process completed { success: true, processed: ${result.processed}, errors: ${result.errors.length} }`)
      return NextResponse.json({ 
        success: true, 
        processed: result.processed, 
        errors: result.errors,
        stats: result.stats
      })
    } else {
      console.log(`❌ API: Signal scouting process completed { success: false, processed: ${result.processed}, errors: ${result.errors} }`)
      return NextResponse.json({ 
        success: false, 
        processed: result.processed, 
        errors: result.errors 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('💥 API: Critical error in scout route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack available'
    console.error('💥 API: Error details:', errorMessage)
    console.error('💥 API: Error stack:', errorStack)
    return NextResponse.json({ 
      success: false, 
      processed: 0, 
      errors: [`Internal server error: ${errorMessage}`] 
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
