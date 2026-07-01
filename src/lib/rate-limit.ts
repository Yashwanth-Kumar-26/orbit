/**
 * Simple in-memory sliding-window rate limiter.
 * No external dependencies -- suitable for MVP.
 */

type Window = {
  count: number;
  resetAt: number;
};

const stores = new Map<string, Window>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, w] of stores) {
    if (w.resetAt < now) stores.delete(key);
  }
}, 300_000);

export type RateLimitConfig = {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
};

const DEFAULTS = {
  // Auth endpoints -- strict (3 attempts per 10s)
  auth: { limit: 3, windowSec: 10 },
  // Mutations (create, edit, delete) -- 10 per 10s
  write: { limit: 10, windowSec: 10 },
  // Reads -- 30 per 10s
  read: { limit: 30, windowSec: 10 },
  // Uploads -- heavy, 3 per 30s
  upload: { limit: 3, windowSec: 30 },
  // Search -- expensive, 10 per 10s
  search: { limit: 10, windowSec: 10 },
};

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULTS.read,
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const entry = stores.get(key);

  if (!entry || entry.resetAt < now) {
    // Fresh window
    stores.set(key, { count: 1, resetAt: now + config.windowSec * 1000 });
    return { allowed: true, remaining: config.limit - 1, resetInSeconds: config.windowSec };
  }

  entry.count++;

  if (entry.count > config.limit) {
    const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetInSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}

export { DEFAULTS as RATE_LIMITS };
