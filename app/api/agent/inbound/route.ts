import { NextRequest } from "next/server";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { parseInboundPayload, extractThreadId } from "@/lib/postmark-inbound";
import { getThread, saveThread, type AgentThread } from "@/lib/thread-store";
import { generateAgentReply } from "@/lib/agent-reply";
import { sendAgentEmail, sendFounderAlertEmail } from "@/lib/email";
import { buildCapReachedMessage } from "@/lib/agent-prompts";

export const runtime = "nodejs";

// Cap on autonomous replies per thread — see PR description / task spec.
// Counts the initial reply sent from app/api/classify/route.ts as reply #1,
// so a thread gets at most 5 more autonomous follow-ups here before the
// 6th (and last) is the fixed "looping in personally" handoff message
// instead of a normal AI-generated reply.
const MAX_AUTO_REPLIES = 6;

// Postmark's Inbound Parse webhook doesn't support custom headers, but does
// support HTTP Basic Auth embedded directly in the webhook URL you register
// in their dashboard (https://user:pass@agent.tioga.ai/api/agent/inbound) —
// see the PR description's setup checklist for the exact URL to register.
// This is the mechanism their own docs recommend for authenticating inbound
// webhook calls; without it this endpoint would be an unauthenticated
// trigger for autonomous outbound email under the business's name.
function isAuthorized(req: NextRequest): boolean {
  const expectedUser = process.env.POSTMARK_INBOUND_BASIC_AUTH_USER;
  const expectedPass = process.env.POSTMARK_INBOUND_BASIC_AUTH_PASS;
  if (!expectedUser || !expectedPass) {
    // Fail closed — an unconfigured secret must never be treated as "no
    // auth required."
    console.error("[agent/inbound] POSTMARK_INBOUND_BASIC_AUTH_USER/PASS not set — rejecting all inbound webhook calls.");
    return false;
  }

  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Basic\s+(.+)$/i);
  if (!match) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(match[1], "base64").toString("utf8");
  } catch {
    return false;
  }
  const sepIndex = decoded.indexOf(":");
  if (sepIndex === -1) return false;
  const user = decoded.slice(0, sepIndex);
  const pass = decoded.slice(sepIndex + 1);

  const userBuf = Buffer.from(user);
  const expectedUserBuf = Buffer.from(expectedUser);
  const passBuf = Buffer.from(pass);
  const expectedPassBuf = Buffer.from(expectedPass);

  // timingSafeEqual throws on mismatched lengths rather than returning
  // false, and requires equal-length buffers — guard both explicitly so a
  // length mismatch can't leak timing info either.
  const userOk = userBuf.length === expectedUserBuf.length && crypto.timingSafeEqual(userBuf, expectedUserBuf);
  const passOk = passBuf.length === expectedPassBuf.length && crypto.timingSafeEqual(passBuf, expectedPassBuf);
  return userOk && passOk;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "";
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let email;
  try {
    email = parseInboundPayload(raw);
  } catch (err) {
    console.error("[agent/inbound] Payload failed validation:", err);
    return new Response(JSON.stringify({ error: "Payload did not match the expected Postmark Inbound Parse shape." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Abuse protection on this new public webhook surface: cap total inbound
  // messages accepted per sender per time window, independent of the
  // per-thread autonomous-reply cap below. Returns 200 rather than an error
  // status so a spam/abuse sender doesn't cause Postmark to keep retrying
  // delivery — we've deliberately chosen not to process it, not failed to.
  const { allowed } = rateLimit(`agent-inbound:${email.fromEmail}`, 30, 24 * 60 * 60 * 1000);
  if (!allowed) {
    console.error(`[agent/inbound] Rate limit exceeded for sender ${email.fromEmail}`);
    return new Response(JSON.stringify({ ok: true, skipped: "rate_limited" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const threadId = extractThreadId(email);
  if (!threadId) {
    console.error(`[agent/inbound] Could not recover a thread ID from recipient addresses: ${email.toAddresses.join(", ")}`);
    try {
      await sendFounderAlertEmail({
        subject: email.subject,
        note: `Inbound mail arrived at the agent address with no recoverable thread ID (recipients: ${email.toAddresses.join(", ") || "none parsed"}). It was not auto-replied to.`,
        threadId: "unknown",
        prospectEmail: email.fromEmail,
      });
    } catch (err) {
      console.error("[agent/inbound] Founder alert send failed:", err);
    }
    return new Response(JSON.stringify({ ok: true, skipped: "no_thread_id" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const thread = await getThread(threadId);
  if (!thread) {
    console.error(`[agent/inbound] No stored thread for id ${threadId}`);
    try {
      await sendFounderAlertEmail({
        subject: email.subject,
        note: `Inbound mail referenced thread ${threadId}, but no matching thread record exists (expired or invalid). It was not auto-replied to.`,
        threadId,
        prospectEmail: email.fromEmail,
      });
    } catch (err) {
      console.error("[agent/inbound] Founder alert send failed:", err);
    }
    return new Response(JSON.stringify({ ok: true, skipped: "unknown_thread" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = new Date().toISOString();

  // Thread already handed off — record the message for the audit trail but
  // don't auto-reply again; the prospect was already told a human is
  // taking over.
  if (thread.cappedAt) {
    thread.messages.push({ role: "prospect", text: email.body, timestamp: now });
    try {
      await saveThread(thread);
    } catch (err) {
      console.error("[agent/inbound] Failed to save thread after capped-thread message:", err);
    }
    try {
      await sendFounderAlertEmail({
        subject: thread.subject,
        note: `New message on a thread that already hit the ${MAX_AUTO_REPLIES}-reply autonomous cap and was handed off. No autonomous reply was sent.\n\nMessage:\n${email.body}`,
        threadId,
        prospectEmail: email.fromEmail,
      });
    } catch (err) {
      console.error("[agent/inbound] Founder alert send failed:", err);
    }
    return new Response(JSON.stringify({ ok: true, skipped: "thread_capped" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  thread.messages.push({ role: "prospect", text: email.body, timestamp: now });

  const nextReplyNumber = thread.autoReplyCount + 1;
  const hittingCap = nextReplyNumber >= MAX_AUTO_REPLIES;

  let replySubject: string;
  let replyBody: string;

  try {
    if (hittingCap) {
      replySubject = thread.subject.toLowerCase().startsWith("re:") ? thread.subject : `Re: ${thread.subject}`;
      replyBody = buildCapReachedMessage(firstName(thread.prospectName));
    } else {
      const generated = await generateAgentReply({
        prospectName: thread.prospectName,
        company: thread.company,
        classification: thread.classification,
        subject: thread.subject,
        messages: thread.messages,
      });
      replySubject = generated.subject;
      replyBody = generated.body;
    }
  } catch (err) {
    console.error("[agent/inbound] Reply generation failed:", err);
    // Don't leave the prospect's message unanswered and unflagged just
    // because generation failed — surface it to the founder instead of
    // silently dropping it.
    try {
      await sendFounderAlertEmail({
        subject: thread.subject,
        note: `Reply generation failed for an inbound message on this thread — no autonomous reply was sent. Error: ${err instanceof Error ? err.message : String(err)}\n\nMessage:\n${email.body}`,
        threadId,
        prospectEmail: email.fromEmail,
      });
    } catch (alertErr) {
      console.error("[agent/inbound] Founder alert send failed:", alertErr);
    }
    return new Response(JSON.stringify({ error: "Reply generation failed." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await sendAgentEmail({
      to: thread.prospectEmail,
      subject: replySubject,
      text: replyBody,
      threadId,
    });
  } catch (err) {
    console.error("[agent/inbound] Send failed:", err);
    return new Response(JSON.stringify({ error: "Send failed." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  thread.messages.push({ role: "agent", text: replyBody, timestamp: new Date().toISOString() });
  thread.autoReplyCount = nextReplyNumber;
  if (hittingCap) {
    thread.cappedAt = new Date().toISOString();
  }

  try {
    await saveThread(thread as AgentThread);
  } catch (err) {
    // The reply already went out — a save failure here means the next
    // inbound message won't have this turn in its history, but must not
    // be reported back to Postmark as a send failure (it isn't one).
    console.error("[agent/inbound] Failed to save thread after reply:", err);
  }

  if (hittingCap) {
    try {
      await sendFounderAlertEmail({
        subject: thread.subject,
        note: `This thread just hit the ${MAX_AUTO_REPLIES}-reply autonomous cap. The final "looping in personally" message was sent to the prospect; no further autonomous replies will go out on this thread.`,
        threadId,
        prospectEmail: thread.prospectEmail,
      });
    } catch (err) {
      console.error("[agent/inbound] Founder alert send failed:", err);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
