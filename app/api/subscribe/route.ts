import { NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { appendSubscriberLog } from "@/lib/subscriber-log";

export const runtime = "nodejs";

// Loose but real email shape check — not a full RFC 5322 validator (not
// worth the complexity for a low-stakes capture form), just enough to
// reject obvious junk before it reaches the founder's inbox.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Tighter window than demo-email's 30/24h — this is a one-click capture
  // form, not a tool a legitimate visitor would call repeatedly.
  const { allowed } = rateLimit(`subscribe:${ip}`, 5, 24 * 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429 });
  }

  let email: unknown;
  try {
    ({ email } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return new Response(JSON.stringify({ error: "Enter a valid email address." }), { status: 400 });
  }

  try {
    await appendSubscriberLog({
      timestamp: new Date().toISOString(),
      ip,
      email: email.trim(),
    });
  } catch (err) {
    // appendSubscriberLog is itself best-effort/non-throwing on its own
    // channels, so reaching here means something unexpected broke before
    // any channel ran -- fail the request rather than silently claim success.
    console.error("[subscribe] unexpected failure:", err);
    return new Response(JSON.stringify({ error: "Something went wrong. Try again." }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
