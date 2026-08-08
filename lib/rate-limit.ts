// Simple in-memory rate limiter (for production, replace with Upstash Redis —
// this Map resets on every serverless cold start and isn't shared across
// instances, so these caps are a speed bump against casual abuse, not a hard
// enforcement boundary against a deliberate one)
const ipMap = new Map<string, { count: number; resetAt: number }>();

// x-forwarded-for can carry a client-supplied chain of proxy hops
// (client, proxy1, proxy2, ...) — only the first hop closest to Vercel's own
// edge is trustworthy; keying on the full raw header lets a caller rotate
// its own claimed IP by varying hops it controls further down the chain.
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  const raw = req.headers.get("x-forwarded-for");
  if (!raw) return "unknown";
  return raw.split(",")[0].trim() || "unknown";
}

export function rateLimit(
  ip: string,
  limit = 100,
  windowMs = 24 * 60 * 60 * 1000 // default: 24 hours (existing callers unchanged)
): { allowed: boolean; remaining: number } {
  const now = Date.now();

  const entry = ipMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}
