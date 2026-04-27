// Sliding-window rate limiter backed by the same Redis we use for snap state.
// Two layers: short burst window + long sustained window. Both must pass.

import { createClient, type RedisClientType } from 'redis';

const HAS_REDIS = Boolean(process.env.REDIS_URL);
let client: RedisClientType | null = null;
let connectPromise: Promise<RedisClientType> | null = null;

async function getClient(): Promise<RedisClientType | null> {
  if (!HAS_REDIS) return null;
  if (client?.isOpen) return client;
  if (connectPromise) return connectPromise;
  connectPromise = (async () => {
    const c = createClient({ url: process.env.REDIS_URL });
    c.on('error', (err) => console.error('rate-limit redis error', err));
    await c.connect();
    client = c as RedisClientType;
    return client;
  })();
  try {
    return await connectPromise;
  } finally {
    connectPromise = null;
  }
}

export interface RateLimitWindow {
  /** Redis key suffix - usually "<bucket>:<identifier>". */
  key: string;
  /** Window length in seconds. */
  windowSec: number;
  /** Max hits permitted in the window. */
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Hits counted including this one. */
  count: number;
  /** Seconds until the window resets. */
  retryAfter: number;
  /** Which window failed (if any). */
  bucket?: string;
}

/**
 * Check + increment a sliding-window counter. Uses a Redis INCR + EXPIRE NX
 * pattern. Returns { ok: false, retryAfter } if any of the configured windows
 * is over the cap. Fails open if Redis is unreachable.
 */
export async function rateLimit(windows: RateLimitWindow[]): Promise<RateLimitResult> {
  const c = await getClient();
  if (!c) return { ok: true, count: 0, retryAfter: 0 };

  let worst: RateLimitResult = { ok: true, count: 0, retryAfter: 0 };
  for (const w of windows) {
    const key = `rl:${w.key}:${w.windowSec}`;
    try {
      const count = await c.incr(key);
      // Set expiry only on first hit (so the window is sliding by reset, not by activity).
      if (count === 1) await c.expire(key, w.windowSec);
      if (count > w.max) {
        const ttl = await c.ttl(key);
        return {
          ok: false,
          count,
          retryAfter: Math.max(1, ttl),
          bucket: w.key,
        };
      }
      if (count > worst.count) worst = { ok: true, count, retryAfter: 0 };
    } catch {
      // fail open per window
    }
  }
  return worst;
}

/** Pull the caller's IP from common edge headers. Falls back to "unknown". */
export function ipOf(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      bucket: result.bucket,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter),
        'access-control-allow-origin': '*',
      },
    },
  );
}
