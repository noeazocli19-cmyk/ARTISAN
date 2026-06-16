/**
 * Rate Limiting Utility for Artisan Connect
 *
 * In-memory sliding window rate limiter that tracks requests by IP address.
 * Handles X-Forwarded-For header for proxied requests (Caddy gateway).
 * Automatically cleans up stale entries to prevent memory leaks.
 *
 * Usage:
 * ```typescript
 * import { rateLimit } from '@/lib/rate-limit'
 *
 * export async function GET(request: NextRequest) {
 *   const limiter = rateLimit(request, { limit: 100, window: 60 })
 *   if (!limiter.success) {
 *     return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429, headers: limiter.headers })
 *   }
 *   // ... normal logic
 * }
 * ```
 */

import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration for a single rate-limit check. */
export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number
  /** Window duration in seconds. */
  window: number
  /** Optional key prefix to namespace different endpoint groups (e.g. "auth", "upload"). */
  prefix?: string
}

/** Result returned by the `rateLimit` function. */
export interface RateLimitResult {
  /** Whether the request is within the allowed limit. */
  success: boolean
  /** Number of requests the client can still make in the current window. */
  remaining: number
  /** Standard RateLimit HTTP headers to include in the response. */
  headers: Record<string, string>
}

// ---------------------------------------------------------------------------
// Predefined limit presets for common endpoint categories
// ---------------------------------------------------------------------------

export const RATE_LIMIT_PRESETS = {
  /** General API endpoints – 100 requests / 60 s */
  general: { limit: 100, window: 60, prefix: 'general' },
  /** Authentication endpoints (login, register) – 20 requests / 60 s */
  auth: { limit: 20, window: 60, prefix: 'auth' },
  /** File upload endpoints – 10 requests / 60 s */
  upload: { limit: 10, window: 60, prefix: 'upload' },
} as const

export type RateLimitPreset = keyof typeof RATE_LIMIT_PRESETS

// ---------------------------------------------------------------------------
// Internal store
// ---------------------------------------------------------------------------

/**
 * Each bucket stores an array of timestamps (in milliseconds) representing
 * the times at which requests were made within the current sliding window.
 */
interface Bucket {
  timestamps: number[]
}

/**
 * Global in-memory store keyed by `prefix:ip`.
 * Using a Map for O(1) lookups.
 */
const store = new Map<string, Bucket>()

/** Timestamp of the last cleanup sweep. */
let lastCleanup = Date.now()

/** How often (ms) to sweep stale entries from the store. */
const CLEANUP_INTERVAL_MS = 60_000 // 60 seconds

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the client IP from a NextRequest.
 * Respects the `X-Forwarded-For` header set by Caddy (or any reverse-proxy).
 * The left-most value in X-Forwarded-For is the original client IP.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // X-Forwarded-For may contain multiple IPs: client, proxy1, proxy2, …
    // We want the first (original client) IP.
    const firstIp = forwarded.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }

  // Fallback: some proxies use this header
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  // Last resort – NextRequest.ip may be populated in some deployments
  // but is often undefined in serverless. Fallback to a fixed key so
  // we never crash; in production the proxy headers should be set.
  return request.ip ?? 'unknown'
}

/**
 * Remove stale entries from the store to prevent unbounded memory growth.
 *
 * A bucket is considered stale when ALL of its timestamps are older than
 * the largest window we track. We compute the max window dynamically from
 * the presets so that adding a new preset with a longer window is safe.
 */
function cleanup(): void {
  const now = Date.now()

  // Only run cleanup once per CLEANUP_INTERVAL_MS
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  // Determine the maximum window across all presets so we keep entries that
  // could still be relevant for the longest-running window.
  const maxWindowMs = Math.max(
    ...Object.values(RATE_LIMIT_PRESETS).map((p) => p.window * 1000),
    60_000 // at least 60 s
  )

  for (const [key, bucket] of store) {
    // Prune individual timestamps older than the max window
    bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < maxWindowMs)

    // If the bucket is now empty, remove it entirely
    if (bucket.timestamps.length === 0) {
      store.delete(key)
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether the incoming request should be allowed based on rate limits.
 *
 * Uses a **sliding window** algorithm: for a given key (`prefix:ip`), we keep
 * an array of timestamps. On each request we:
 *  1. Discard timestamps older than `window` seconds.
 *  2. Count the remaining timestamps – if the count is < `limit`, the request
 *     is allowed and we push the current timestamp; otherwise it is rejected.
 *
 * @param request - The incoming Next.js request object.
 * @param options - Rate limit configuration (limit, window, prefix).
 * @returns A `RateLimitResult` with `success`, `remaining`, and `headers`.
 *
 * @example
 * ```ts
 * // Using a preset
 * const limiter = rateLimit(request, RATE_LIMIT_PRESETS.auth)
 *
 * // Using custom values
 * const limiter = rateLimit(request, { limit: 50, window: 30, prefix: 'search' })
 * ```
 */
export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): RateLimitResult {
  // Run cleanup on every call (actual sweep only fires once per interval)
  cleanup()

  const { limit, window: windowSec, prefix = 'default' } = options
  const windowMs = windowSec * 1000
  const now = Date.now()

  // Build the store key
  const ip = getClientIp(request)
  const key = `${prefix}:${ip}`

  // Retrieve or create bucket
  let bucket = store.get(key)
  if (!bucket) {
    bucket = { timestamps: [] }
    store.set(key, bucket)
  }

  // Remove timestamps outside the sliding window
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs)

  const currentCount = bucket.timestamps.length
  const success = currentCount < limit

  if (success) {
    // Record this request
    bucket.timestamps.push(now)
  }

  // Compute the reset time: when the oldest timestamp in the window expires.
  // If there are no timestamps (first request), reset is one full window from now.
  const oldestTimestamp =
    bucket.timestamps.length > 0 ? bucket.timestamps[0] : now
  const resetTimeSec = Math.ceil(
    (oldestTimestamp + windowMs - now) / 1000
  )

  const remaining = Math.max(0, limit - bucket.timestamps.length)

  const headers: Record<string, string> = {
    'RateLimit-Limit': String(limit),
    'RateLimit-Remaining': String(remaining),
    'RateLimit-Reset': String(resetTimeSec),
    // Also include the Retry-After header on failure (seconds to wait)
    ...(success
      ? {}
      : { 'Retry-After': String(resetTimeSec) }),
  }

  return { success, remaining, headers }
}

/**
 * Convenience wrapper that uses a named preset instead of raw options.
 *
 * @example
 * ```ts
 * const limiter = rateLimitByPreset(request, 'auth')
 * ```
 */
export function rateLimitByPreset(
  request: NextRequest,
  preset: RateLimitPreset
): RateLimitResult {
  return rateLimit(request, RATE_LIMIT_PRESETS[preset])
}
