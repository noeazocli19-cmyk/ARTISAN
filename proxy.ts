import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Redirect root '/' to main app search page
  if (pathname === '/') {
    const url = req.nextUrl.clone()
    url.pathname = '/search'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/'],
}
