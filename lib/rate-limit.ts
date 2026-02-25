// Simple in-memory rate limiter (for production, replace with Upstash Redis)
const ipMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, limit = 100): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours

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
