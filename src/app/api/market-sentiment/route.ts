import { NextRequest, NextResponse } from 'next/server'
import { generateDailyMarketSentiment, generateDailySentimentForAllUsers } from '@/lib/agent/market-sentiment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.user_id
    
    if (userId) {
      // Generate sentiment for specific user
      console.log(`API: Generating market sentiment for user: ${userId}`)
      
      const result = await generateDailyMarketSentiment(userId)
      
      if (result) {
        return NextResponse.json({ 
          success: true, 
          sentiment: result 
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to generate sentiment' 
        }, { status: 500 })
      }
    } else {
      // Generate sentiment for all users (daily cron job)
      console.log('API: Generating daily market sentiment for all users')
      
      const result = await generateDailySentimentForAllUsers()
      
      return NextResponse.json({ 
        success: result.success, 
        processed: result.processed, 
        errors: result.errors 
      })
    }
    
  } catch (error) {
    console.error('API: Error in market sentiment route:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    return NextResponse.json({ 
      message: 'Market sentiment API endpoint. Use POST to trigger sentiment analysis.',
      endpoints: {
        POST: 'Trigger market sentiment analysis (with user_id for specific user, without for all users)'
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'API endpoint error'
    }, { status: 500 })
  }
}
