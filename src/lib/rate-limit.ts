/**
 * Fixed-window limiter for the public, unauthenticated write endpoints.
 *
 * These three routes each insert a row and send an email, so an unthrottled
 * client can fill the database and burn the SMTP quota with a shell loop.
 *
 * Deliberately in-memory: on serverless each instance keeps its own counter, so
 * this raises the cost of abuse rather than eliminating it. It is the right
 * trade for an institute site; move to Redis or a `RateLimit` table if the
 * volume ever justifies it.
 */
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs = WINDOW_MS) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    // Opportunistic sweep so the map cannot grow without bound.
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    return { ok: true, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > max) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client address. Vercel and most proxies set x-forwarded-for. */
export function clientIp(request: Request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
