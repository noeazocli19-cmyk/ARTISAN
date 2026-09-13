// src/proxy.ts
import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

// Note: do not export `config` from this file to avoid Next treating it as
// a middleware module. Middleware must be implemented in `middleware.js` or
// `middleware.ts` at the project root. Keep this helper for use elsewhere.
