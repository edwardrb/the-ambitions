import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Check if user is authenticated
    const token = request.cookies.get('auth_token')
    
    // If no valid authentication, redirect to homepage
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // If user is authenticated but accessing main dashboard, check if setup is complete
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      try {
        // Check if user has preferences set
        const { data: userPrefs, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', 'current_user') // TODO: Replace with actual user ID from token
          .single()

        // If no preferences exist, redirect to setup
        if (!userPrefs || error) {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard/setup'
          return NextResponse.redirect(url)
        }
      } catch (error) {
        // If there's an error checking preferences, redirect to setup to be safe
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/setup'
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
