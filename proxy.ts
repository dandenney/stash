import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie =
    request.cookies.get('sb-access-token') ??
    request.cookies.get(
      `sb-${process.env.SUPABASE_URL?.match(/\/\/([^.]+)/)?.[1]}-auth-token`
    )

  if (pathname.startsWith('/dashboard') && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
