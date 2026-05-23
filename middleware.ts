import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const role = request.cookies.get('__session_role')?.value
  const { pathname } = request.nextUrl

  // Protected route logic
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/staff') || pathname.startsWith('/kitchen')

  if (isProtectedRoute) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based access control
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
    if (pathname.startsWith('/staff') && role !== 'waiter') {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
    if (pathname.startsWith('/kitchen') && role !== 'kitchen') {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/kitchen/:path*'],
}
