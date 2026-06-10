/**
 * In-memory cache utility with TTL support for server-side caching.
 * Reduces database load and improves performance for high concurrency scenarios.
 */

// --- TTL Constants ---
export const TTL = {
  /** 30 seconds — artisan lists */
  ARTISAN_LIST: 30_000,
  /** 60 seconds — categories */
  CATEGORIES: 60_000,
  /** 10 seconds — search results (freshness matters) */
  SEARCH: 10_000,
  /** 120 seconds — stats (rarely change) */
  STATS: 120_000,
} as const

// --- Internal Types ---
interface CacheEntry<T> {
  value: T
  expiresAt: number // epoch ms
}

// --- Cache Store ---
const store = new Map<string, CacheEntry<unknown>>()

// --- Hit / Miss Tracking ---
let hits = 0
let misses = 0

// --- Automatic Cleanup ---
const CLEANUP_INTERVAL = 30_000 // 30 seconds

function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now >= entry.expiresAt) {
      store.delete(key)
    }
  }
}

// Use globalThis so the interval survives HMR in development
const globalForCache = globalThis as unknown as {
  __cacheCleanupTimer: ReturnType<typeof setInterval> | undefined
}

if (!globalForCache.__cacheCleanupTimer) {
  globalForCache.__cacheCleanupTimer = setInterval(cleanup, CLEANUP_INTERVAL)
  // Allow the process to exit even if the timer is still running
  if (globalForCache.__cacheCleanupTimer.unref) {
    globalForCache.__cacheCleanupTimer.unref()
  }
}

// --- Public API ---

/**
 * Get a value from cache, or execute `fn` and cache the result.
 *
 * @param key    - Unique cache key (use prefixes like `artisans:`, `search:` for grouping)
 * @param fn     - Async function that produces the value when cache misses
 * @param ttlMs  - Time-to-live in milliseconds. Defaults to TTL.ARTISAN_LIST (30s)
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = TTL.ARTISAN_LIST,
): Promise<T> {
  const now = Date.now()
  const entry = store.get(key) as CacheEntry<T> | undefined

  if (entry && now < entry.expiresAt) {
    hits++
    return entry.value
  }

  // Cache miss — execute the function
  misses++
  const value = await fn()
  store.set(key, { value, expiresAt: now + ttlMs })
  return value
}

/**
 * Invalidate (remove) a specific cache key.
 */
export function invalidateCache(key: string): void {
  store.delete(key)
}

/**
 * Invalidate all cache keys that start with the given prefix.
 *
 * Example: `invalidateCachePrefix('artisans:')` clears `artisans:list`, `artisans:featured`, etc.
 */
export function invalidateCachePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key)
    }
  }
}

/**
 * Clear the entire cache.
 */
export function clearCache(): void {
  store.clear()
  hits = 0
  misses = 0
}

/**
 * Get cache statistics for monitoring / admin dashboard.
 */
export function getCacheStats(): {
  size: number
  hitRate: number
  keys: string[]
} {
  // Prune expired entries first for an accurate count
  cleanup()

  const total = hits + misses
  return {
    size: store.size,
    hitRate: total === 0 ? 0 : hits / total,
    keys: Array.from(store.keys()),
  }
}
