// Simple in-memory rate limiter (for production, replace with Upstash Redis)
const ipMap = new Map<string, { count: number; resetAt: number }>();

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
