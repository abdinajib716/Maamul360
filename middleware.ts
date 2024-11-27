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
  const { pathname, host } = url
  
  // Skip middleware for bypass paths
  if (BYPASS_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check if this is a main domain request
  const isMainDomain = MAIN_DOMAINS.includes(host)

  // Handle public paths on main domain
  if (isMainDomain) {
    if (PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.next()
    }

    // Block tenant-only paths on main domain
    if (TENANT_ONLY_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Handle tenant subdomain requests
  if (!isMainDomain) {
    // Extract tenant from subdomain
    const subdomain = host.split('.')[0]
    
    // Block public paths on tenant subdomains
    if (PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL(`http://maamul360.local:3000${pathname}`))
    }

    // Allow tenant-specific paths
    if (TENANT_ONLY_PATHS.includes(pathname)) {
      return NextResponse.next()
    }

    // Allow verification paths
    if (VERIFICATION_PATHS.includes(pathname)) {
      return NextResponse.next()
    }
  }

  // Default to main domain homepage for unmatched routes
  if (pathname === '/') {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/', request.url))
}

// Configure matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
