import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    if (!userId) {
      return NextResponse.redirect(new URL('/?error=missing_user_id', process.env.NEXT_PUBLIC_APP_URL))
    }
    
    // Update user's interested_in_paid status
    const { error } = await supabase
      .from('users')
      .update({ interested_in_paid: true })
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error updating user paid interest:', error)
      return NextResponse.redirect(new URL('/?error=database_error', process.env.NEXT_PUBLIC_APP_URL))
    }
    
    return NextResponse.redirect(new URL('/thank-you', process.env.NEXT_PUBLIC_APP_URL))
    
  } catch (error) {
    console.error('Upgrade API error:', error)
    return NextResponse.redirect(new URL('/?error=server_error', process.env.NEXT_PUBLIC_APP_URL))
  }
}
