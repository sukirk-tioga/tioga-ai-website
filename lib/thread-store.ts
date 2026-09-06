// Persistent conversation state for the autonomous email agent
// (app/api/agent/inbound/route.ts + app/api/classify/route.ts). A contact-
// form submission and every inbound reply after it both need to read/write
// the same thread record across separate, stateless serverless invocations
// — lib/rate-limit.ts's in-memory Map can't do that (it resets on cold
// start and isn't shared across instances), so this uses Upstash Redis's
// REST client instead: no persistent connection to manage from a
// serverless function, just HTTP calls, which is the simplest integration
// path into this repo (see PR description for why Upstash over Vercel KV —
// no existing DB/KV integration in this repo prior to this change).
import { Redis } from "@upstash/redis";

// Real conversation history sent back to Claude as context on every reply
// — must carry both sides, not just the prospect's messages.
export interface AgentMessage {
  role: "prospect" | "agent";
  text: string;
  timestamp: string;
}

export interface AgentThread {
  threadId: string;
  prospectEmail: string;
  prospectName: string;
  company: string;
  // The email subject the thread started on — reused (with "Re:" framing)
  // on every follow-up so the prospect's mail client keeps threading it
  // correctly instead of the model inventing a slightly different one on
  // every turn.
  subject: string;
  createdAt: string;
  updatedAt: string;
  // The classifier's original structured read on the inquiry — reused as
  // context for every autonomous reply, not just the first one.
  classification: {
    service: string;
    urgency: string;
    complexity: string;
    summary: string;
    nextStep: string;
    responseTime: string;
    fitScore: number;
  };
  messages: AgentMessage[];
  // Counts autonomous replies sent (not inbound messages received) — this
  // is what the 6-reply safety cap in the task spec is measured against.
  autoReplyCount: number;
  // Set once the cap is hit and the "looping in personally" handoff message
  // has been sent. No further autonomous replies go out on a capped
  // thread — new inbound mail just gets BCC'd to hello@tioga.ai flagged
  // [NEEDS FOUNDER].
  cappedAt: string | null;
}

const THREAD_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days — bounds storage growth for a low-volume contact form

function client(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set — the email agent's conversation store is unavailable."
    );
  }
  return new Redis({ url, token });
}

function key(threadId: string): string {
  return `agent-thread:${threadId}`;
}

// Base64url is safe both as an email local-part token (reply+{id}@...) and
// as a Redis key segment — no +, /, or = padding characters to escape.
export function generateThreadId(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(12))).toString("base64url");
}

export async function createThread(input: {
  threadId: string;
  prospectEmail: string;
  prospectName: string;
  company: string;
  subject: string;
  classification: AgentThread["classification"];
  firstInboundMessage: string;
  firstReply: string;
}): Promise<AgentThread> {
  const now = new Date().toISOString();
  const thread: AgentThread = {
    threadId: input.threadId,
    prospectEmail: input.prospectEmail,
    prospectName: input.prospectName,
    company: input.company,
    subject: input.subject,
    createdAt: now,
    updatedAt: now,
    classification: input.classification,
    messages: [
      { role: "prospect", text: input.firstInboundMessage, timestamp: now },
      { role: "agent", text: input.firstReply, timestamp: now },
    ],
    autoReplyCount: 1,
    cappedAt: null,
  };
  await client().set(key(thread.threadId), thread, { ex: THREAD_TTL_SECONDS });
  return thread;
}

export async function getThread(threadId: string): Promise<AgentThread | null> {
  const thread = await client().get<AgentThread>(key(threadId));
  return thread ?? null;
}

export async function saveThread(thread: AgentThread): Promise<void> {
  thread.updatedAt = new Date().toISOString();
  await client().set(key(thread.threadId), thread, { ex: THREAD_TTL_SECONDS });
}
