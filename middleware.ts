import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that should bypass middleware
const BYPASS_PATHS = [
  '/_next',
  '/api',
  '/static',
  '/assets',
  '/favicon.ico',
]

// Tenant-specific paths (these should only work on tenant subdomains)
const TENANT_ONLY_PATHS = [
  '/dashboard',
  '/settings',
  '/profile',
  '/inventory',
  '/reports',
  '/login'
]

// Public paths (accessible on main domain)
const PUBLIC_PATHS = [
  '/',
  '/register',
  '/about',
  '/contact',
  '/registration-success',
  '/pricing',
  '/features',
  '/verify-success'
]

// Verification paths (accessible on both main and tenant domains)
const VERIFICATION_PATHS = [
  '/verify-email'
]

// Main domain hosts
const MAIN_DOMAINS = [
  'localhost:3000',
  'maamul360.local:3000'
]

export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  const { pathname, host, search } = url
  
  console.log('\n[Middleware] Request:', {
    url: request.url,
    pathname,
    host,
    search,
    cookies: request.cookies.toString()
  })
  
  // Skip middleware for bypass paths
  if (BYPASS_PATHS.some(path => pathname.startsWith(path))) {
    console.log('[Middleware] Bypassing middleware for path:', pathname)
    return NextResponse.next()
  }

  // Check if this is a main domain request
  const isMainDomain = MAIN_DOMAINS.includes(host)
  console.log('[Middleware] Domain check:', { host, isMainDomain })

  // Handle tenant subdomain requests
  if (!isMainDomain) {
    const subdomain = host.split('.')[0]
    console.log('[Middleware] Processing tenant subdomain request:', { subdomain, pathname })
    
    // If path is empty or root on tenant subdomain, redirect to /login
    if (pathname === '/' || pathname === '') {
      const loginUrl = new URL(`http://${host}/login${search}`)
      console.log('[Middleware] Redirecting root to login:', loginUrl.toString())
      return NextResponse.redirect(loginUrl)
    }

    // Block public paths on tenant subdomains (except verify-success)
    if (PUBLIC_PATHS.includes(pathname) && pathname !== '/verify-success') {
      const mainUrl = new URL(`http://maamul360.local:3000${pathname}`)
      console.log('[Middleware] Redirecting public path to main domain:', mainUrl.toString())
      return NextResponse.redirect(mainUrl)
    }

    // Allow tenant-specific paths
    if (TENANT_ONLY_PATHS.includes(pathname)) {
      console.log('[Middleware] Allowing tenant path:', pathname)
      const response = NextResponse.next()
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    // Allow verification paths
    if (VERIFICATION_PATHS.includes(pathname)) {
      console.log('[Middleware] Allowing verification path:', pathname)
      return NextResponse.next()
    }

    // For any other paths on tenant subdomain, redirect to login
    console.log('[Middleware] Unmatched tenant path, redirecting to login:', pathname)
    const loginUrl = new URL(`http://${host}/login${search}`)
    return NextResponse.redirect(loginUrl)
  }

  // Handle main domain requests
  if (isMainDomain) {
    console.log('[Middleware] Processing main domain request:', pathname)
    
    // Allow public paths on main domain
    if (PUBLIC_PATHS.includes(pathname)) {
      console.log('[Middleware] Allowing public path on main domain:', pathname)
      return NextResponse.next()
    }

    // Block tenant-only paths on main domain
    if (TENANT_ONLY_PATHS.includes(pathname)) {
      console.log('[Middleware] Blocking tenant path on main domain:', pathname)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  console.log('[Middleware] Allowing unmatched path:', pathname)
  const response = NextResponse.next()
  response.headers.set('x-middleware-cache', 'no-cache')
  return response
}

// Configure matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
