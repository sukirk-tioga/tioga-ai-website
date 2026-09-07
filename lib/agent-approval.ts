// Human-approval hold for the autonomous email agent's outbound replies.
//
// Both call sites that used to call lib/email.ts's sendAgentEmail() directly
// (app/api/classify/route.ts's first reply, app/api/agent/inbound/route.ts's
// follow-ups) now draft the reply, park it here instead of sending it, and
// notify the founder with an approve/reject link
// (lib/email.ts's sendAgentReplyApprovalEmail). Nothing reaches the
// prospect until app/api/agent/approve/route.ts resolves that link — and
// even then, only if AGENT_EMAIL_AUTOSEND_ENABLED="true" (see that route).
//
// Two independent adversarial launch-readiness reviews (2026-09-06,
// 2026-09-07) flagged the previous fully-autonomous-send design as a real
// risk: classification working correctly doesn't mean a generated reply's
// specific commitments (e.g. an unauthorized follow-up promise) were ever
// authorized. This is the fix.
//
// Reuses the same Upstash Redis REST store already wired in for
// lib/thread-store.ts — no new storage dependency introduced.
import { Redis } from "@upstash/redis";
import type { AgentThread } from "./thread-store";

export type PendingApprovalKind = "new_thread" | "inbound_reply";

export interface PendingApproval {
  approvalId: string;
  kind: PendingApprovalKind;
  to: string;
  prospectName: string;
  subject: string;
  body: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected" | "sent";
  // Populated when kind === "new_thread": everything sendAgentEmail's
  // caller (app/api/classify/route.ts) would otherwise have passed straight
  // to lib/thread-store.ts's createThread() once the send succeeded.
  newThread?: {
    threadId: string;
    company: string;
    classification: AgentThread["classification"];
    firstInboundMessage: string;
  };
  // Populated when kind === "inbound_reply": everything
  // app/api/agent/inbound/route.ts needs to finish updating the existing
  // thread record once the send succeeds.
  inboundReply?: {
    threadId: string;
    hittingCap: boolean;
  };
}

const APPROVAL_TTL_SECONDS = 14 * 24 * 60 * 60; // 14 days — long enough for a founder to act on a notification email, bounded storage growth

function client(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set — the email agent's approval queue is unavailable."
    );
  }
  return new Redis({ url, token });
}

function key(approvalId: string): string {
  return `agent-approval:${approvalId}`;
}

// 24 bytes (vs. thread IDs' 12) — this token is a bearer capability that can
// actually trigger a real outbound send once approved, not just recover
// conversation state, so it gets a wider margin against guessing.
export function generateApprovalId(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("base64url");
}

export async function createPendingApproval(
  input: Omit<PendingApproval, "approvalId" | "createdAt" | "status">
): Promise<PendingApproval> {
  const approval: PendingApproval = {
    ...input,
    approvalId: generateApprovalId(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  await client().set(key(approval.approvalId), approval, { ex: APPROVAL_TTL_SECONDS });
  return approval;
}

export async function getPendingApproval(approvalId: string): Promise<PendingApproval | null> {
  const approval = await client().get<PendingApproval>(key(approvalId));
  return approval ?? null;
}

export async function savePendingApproval(approval: PendingApproval): Promise<void> {
  await client().set(key(approval.approvalId), approval, { ex: APPROVAL_TTL_SECONDS });
}
