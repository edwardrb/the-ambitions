import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching top insights from last 7 days...')
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    // Query top 3 signals from last 7 days with outreach_draft and score >= 75
    const { data: signals, error } = await supabase
      .from('signals')
      .select(`
        id,
        title,
        description,
        url,
        suggested_contact,
        outreach_draft,
        confidence_score,
        score_reasoning,
        created_at
      `)
      .gte('created_at', sevenDaysAgo)
      .not('outreach_draft', 'is', null)
      .gte('confidence_score', 75)
      .order('confidence_score', { ascending: false })
      .limit(3)
    
    if (error) {
      console.error('❌ Error fetching insights:', error)
      return NextResponse.json(
        { error: 'Failed to fetch insights', details: error.message },
        { status: 500 }
      )
    }
    
    if (!signals || signals.length === 0) {
      console.log('📭 No high-quality insights found in the last 7 days')
      return NextResponse.json({
        success: true,
        insights: [],
        message: 'No insights available for the last 7 days',
        count: 0
      })
    }
    
    console.log(`✅ Found ${signals.length} high-quality insights`)
    
    // Standardize the response format
    const standardizedInsights = signals.map(signal => ({
      id: signal.id,
      title: signal.title,
      description: signal.description,
      url: signal.url,
      suggested_contact: signal.suggested_contact || 'Not specified',
      outreach_draft: signal.outreach_draft,
      why_it_matters: signal.score_reasoning || signal.description,
      confidence_score: signal.confidence_score,
      created_at: signal.created_at
    }))
    
    return NextResponse.json({
      success: true,
      insights: standardizedInsights,
      count: standardizedInsights.length,
      filters: {
        min_confidence_score: 75,
        days_range: 7,
        requires_outreach_draft: true
      }
    })
    
  } catch (error) {
    console.error('❌ Unexpected error in insights API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { days_range = 7, min_confidence_score = 75, limit = 3 } = body
    
    console.log('🔍 Fetching insights with custom parameters:', { days_range, min_confidence_score, limit })
    
    // Validate input parameters
    if (days_range < 1 || days_range > 30) {
      return NextResponse.json(
        { error: 'days_range must be between 1 and 30' },
        { status: 400 }
      )
    }
    
    if (min_confidence_score < 0 || min_confidence_score > 100) {
      return NextResponse.json(
        { error: 'min_confidence_score must be between 0 and 100' },
        { status: 400 }
      )
    }
    
    if (limit < 1 || limit > 10) {
      return NextResponse.json(
        { error: 'limit must be between 1 and 10' },
        { status: 400 }
      )
    }
    
    // Calculate date based on days_range
    const startDate = new Date(Date.now() - days_range * 24 * 60 * 60 * 1000).toISOString()
    
    // Query signals with custom parameters
    const { data: signals, error } = await supabase
      .from('signals')
      .select(`
        id,
        title,
        description,
        url,
        suggested_contact,
        outreach_draft,
        confidence_score,
        score_reasoning,
        created_at
      `)
      .gte('created_at', startDate)
      .not('outreach_draft', 'is', null)
      .gte('confidence_score', min_confidence_score)
      .order('confidence_score', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('❌ Error fetching insights:', error)
      return NextResponse.json(
        { error: 'Failed to fetch insights', details: error.message },
        { status: 500 }
      )
    }
    
    if (!signals || signals.length === 0) {
      return NextResponse.json({
        success: true,
        insights: [],
        message: `No insights found for the last ${days_range} days with confidence score >= ${min_confidence_score}`,
        count: 0,
        parameters: { days_range, min_confidence_score, limit }
      })
    }
    
    // Standardize the response format
    const standardizedInsights = signals.map(signal => ({
      id: signal.id,
      title: signal.title,
      description: signal.description,
      url: signal.url,
      suggested_contact: signal.suggested_contact || 'Not specified',
      outreach_draft: signal.outreach_draft,
      why_it_matters: signal.score_reasoning || signal.description,
      confidence_score: signal.confidence_score,
      created_at: signal.created_at
    }))
    
    return NextResponse.json({
      success: true,
      insights: standardizedInsights,
      count: standardizedInsights.length,
      parameters: { days_range, min_confidence_score, limit }
    })
    
  } catch (error) {
    console.error('❌ Unexpected error in insights POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
