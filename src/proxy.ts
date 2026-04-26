import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client for proxy with proper session handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Always attempt to refresh the session first
  // This ensures we have the most up-to-date session data
  const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
  
  // If refresh fails, try to get existing session
  let finalSession = session
  if (!session || refreshError) {
    const { data: { session: existingSession } } = await supabase.auth.getSession()
    finalSession = existingSession
  }

  // Debug logging (remove in production)
  console.log('Proxy - Session check:', {
    pathname: req.nextUrl.pathname,
    hasSession: !!finalSession,
    refreshError: !!refreshError,
    userId: finalSession?.user?.id
  })

  // Protected routes
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect unauthenticated users to homepage for protected routes
  if (isProtectedRoute && !finalSession) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Check if user has preferences set when accessing main dashboard
  if (finalSession && (req.nextUrl.pathname === '/dashboard' || req.nextUrl.pathname === '/dashboard/')) {
    try {
      // Check if user has preferences set
      const { data: userPrefs, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', finalSession.user.id)
        .single()

      // If no preferences found, redirect to setup
      if (error || !userPrefs) {
        return NextResponse.redirect(new URL('/dashboard/setup', req.url))
      }
    } catch (error) {
      console.error('Error checking user preferences:', error)
      // If there's an error checking preferences, redirect to setup to be safe
      return NextResponse.redirect(new URL('/dashboard/setup', req.url))
    }
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login']
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && finalSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect authenticated users from homepage to dashboard
  if (req.nextUrl.pathname === '/' && finalSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/']
}
