/**
 * Redis-backed rate limiter via Upstash (stateless, works on Vercel serverless).
 * Falls back to allowing all requests when env vars are missing or Redis errors.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
 *   const allowed = await limiter.check(ip);
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  prefix?: string;
}

// Lazy singleton so we don't crash at build time when env vars are absent.
let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

export function createRateLimiter({ windowMs, max, prefix = 'vouch:rl' }: RateLimiterOptions) {
  // Build the Upstash limiter lazily on first check() call so env vars
  // don't need to exist at module-load / build time.
  let limiter: Ratelimit | null = null;

  function getLimiter(): Ratelimit | null {
    if (limiter) return limiter;
    const r = getRedis();
    if (!r) return null;
    limiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
      prefix,
    });
    return limiter;
  }

  return {
    /** Returns true if the request is within the rate limit, false if it should be rejected. */
    async check(key: string): Promise<boolean> {
      try {
        const rl = getLimiter();
        if (!rl) return true; // graceful fallback: no Redis = allow
        const { success } = await rl.limit(key);
        return success;
      } catch {
        // Redis unreachable: allow the request through rather than blocking users.
        return true;
      }
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
