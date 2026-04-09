/**
 * Simple in-memory rate limiter for single-server deploys.
 * Tracks attempt counts per key (e.g. IP address) within a rolling window.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * @param key      Unique key to rate limit (e.g. "login:1.2.3.4")
 * @param limit    Max allowed attempts within the window
 * @param windowMs Window duration in milliseconds
 * @returns { allowed: boolean; remaining: number; resetAt: number }
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  entry.count += 1
  const allowed = entry.count <= limit
  return { allowed, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt }
}
