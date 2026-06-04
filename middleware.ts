import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { type Role } from './src/constants/roles'
import { ROUTE_MAP } from './src/constants/roles'

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/auth/callback', '/_next', '/favicon.ico']

const ROLE_PREFIXES: Record<Role, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  manager: '/manager',
  caller: '/caller',
  field_exec: '/field',
  social_manager: '/social',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes and static files
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.match(/\.(?:ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not authenticated → redirect to login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Fetch role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as Role | null

  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if user can access this route
  const allowedPrefix = ROLE_PREFIXES[role]
  if (!allowedPrefix || !pathname.startsWith(allowedPrefix)) {
    // Redirect to their correct dashboard
    const dashboard = ROUTE_MAP[role]
    return NextResponse.redirect(new URL(dashboard, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\.png$).*)'],
}
