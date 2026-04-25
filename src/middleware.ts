import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client for middleware with proper session handling
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
  console.log('Middleware - Session check:', {
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

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute && !finalSession) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
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
