/**
 * In-memory rate limiter. Works per Vercel instance.
 * Good enough for spam prevention — not a substitute for infra-level throttling.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
 *   const allowed = limiter.check(ip);
 */

interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

interface BucketEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter({ windowMs, max }: RateLimiterOptions) {
  const store = new Map<string, BucketEntry>();

  // Prune stale entries every ~5 minutes to avoid unbounded memory growth.
  const pruneInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60_000);

  // Allow GC in test/edge environments that don't keep the process alive.
  if (pruneInterval.unref) pruneInterval.unref();

  return {
    /** Returns true if the request is within the rate limit, false if it should be rejected. */
    check(key: string): boolean {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }

      if (entry.count >= max) return false;

      entry.count += 1;
      return true;
    },
  };
}

/** Extract a best-effort IP from Next.js request headers. */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  );
}
