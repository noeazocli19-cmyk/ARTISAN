// =============================================================================
// LEGACY FILE - JWT Authentication (No longer used by Better Auth)
// =============================================================================
// This file contains the OLD JWT authentication system.
// Better Auth now handles all authentication via src/lib/better-auth.ts
// 
// This file is kept for reference only. Do NOT use in production.
// If you need JWT tokens for other purposes, create a new utility file.
// =============================================================================

import jwt from 'jsonwebtoken'
import type { StringValue } from 'ms'

const JWT_SECRET = process.env.JWT_SECRET || 'artisan-connecte-secret-key-2024'

interface JwtPayload {
  userId: string
  email: string
  role: string
}

/**
 * @deprecated Use Better Auth instead. See src/lib/better-auth.ts
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' as StringValue })
}

/**
 * @deprecated Use Better Auth instead. See src/lib/better-auth.ts
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}