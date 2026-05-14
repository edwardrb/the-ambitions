import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()
    
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }
    
    // Update user's weekly_digest preference to false
    const { error } = await supabase
      .from('users')
      .update({ weekly_digest: false })
      .eq('id', user_id)
      .single()
    
    if (error) {
      console.error('Error unsubscribing user:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Successfully unsubscribed' }, { status: 200 })
    
  } catch (error) {
    console.error('Unsubscribe API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
