import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/verify-success'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successfully exchanged code for session
      // Create a response with cookies to ensure session is properly set
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // Set secure cookies for the session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        response.cookies.set('supabase.auth.token', session.access_token, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        })
      }
      
      return response
    }
  }

  // return the user to an error page but you can also redirect to the login page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
