import { NextRequest } from "next/server";
import { getPendingApproval, savePendingApproval } from "@/lib/agent-approval";
import { sendAgentEmail } from "@/lib/email";
import { createThread, getThread, saveThread } from "@/lib/thread-store";

export const runtime = "nodejs";

// Kill switch (task spec item 4): defaults to disabled, same as this
// codebase's pattern of every unconfigured secret/credential failing closed
// (see app/api/agent/inbound/route.ts's isAuthorized()). Approving a draft
// here is a necessary condition for it to send, not a sufficient one — this
// env var is a second, independent gate a founder has to deliberately flip
// before ANY autonomous reply can actually reach a prospect, even one
// that's already been approved.
function autosendEnabled(): boolean {
  return process.env.AGENT_EMAIL_AUTOSEND_ENABLED === "true";
}

function htmlResponse(message: string, status = 200): Response {
  return new Response(
    `<!doctype html><html><body style="font-family: system-ui, sans-serif; max-width: 640px; margin: 60px auto; padding: 0 20px; color: #0f172a;"><p>${message}</p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

// Founder-facing link handler for the human-approval hold (see
// lib/agent-approval.ts). GET, not POST, deliberately — this is meant to be
// clickable straight out of the notification email sent by
// sendAgentReplyApprovalEmail(), no separate login flow. The approval-id
// itself is the bearer-capability token (24 random bytes, unguessable),
// same trust model this codebase already applies to
// reply+{threadId}@agent.tioga.ai thread recovery.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const action = req.nextUrl.searchParams.get("action");

  if (!id || (action !== "approve" && action !== "reject")) {
    return htmlResponse("Missing or invalid approval link parameters.", 400);
  }

  let approval;
  try {
    approval = await getPendingApproval(id);
  } catch (err) {
    console.error("[agent/approve] Failed to look up pending approval:", err);
    return htmlResponse("Could not look up this approval right now. Check server logs.", 500);
  }

  if (!approval) {
    return htmlResponse("This approval link is invalid or has expired.", 404);
  }

  if (approval.status !== "pending") {
    return htmlResponse(
      `This reply was already <strong>${approval.status}</strong>. No action was taken.`
    );
  }

  if (action === "reject") {
    approval.status = "rejected";
    await savePendingApproval(approval);
    return htmlResponse("Rejected. Nothing was sent to the prospect.");
  }

  // action === "approve"
  if (!autosendEnabled()) {
    approval.status = "approved";
    await savePendingApproval(approval);
    return htmlResponse(
      `Approved and recorded — but <code>AGENT_EMAIL_AUTOSEND_ENABLED</code> is not set to "true" in this deployment, so nothing was actually sent. Set that env var and revisit this link to send.`
    );
  }

  const threadId = approval.newThread?.threadId ?? approval.inboundReply?.threadId;
  if (!threadId) {
    console.error("[agent/approve] Pending approval is missing threadId in both newThread and inboundReply:", approval.approvalId);
    return htmlResponse("This approval record is malformed and cannot be sent. Check server logs.", 500);
  }

  try {
    await sendAgentEmail({
      to: approval.to,
      subject: approval.subject,
      text: approval.body,
      threadId,
    });

    if (approval.kind === "new_thread" && approval.newThread) {
      await createThread({
        threadId: approval.newThread.threadId,
        prospectEmail: approval.to,
        prospectName: approval.prospectName,
        company: approval.newThread.company,
        subject: approval.subject,
        classification: approval.newThread.classification,
        firstInboundMessage: approval.newThread.firstInboundMessage,
        firstReply: approval.body,
      });
    } else if (approval.kind === "inbound_reply" && approval.inboundReply) {
      const thread = await getThread(approval.inboundReply.threadId);
      if (thread) {
        thread.messages.push({ role: "agent", text: approval.body, timestamp: new Date().toISOString() });
        thread.autoReplyCount += 1;
        if (approval.inboundReply.hittingCap) {
          thread.cappedAt = new Date().toISOString();
        }
        await saveThread(thread);
      } else {
        console.error(`[agent/approve] Approved reply's thread ${approval.inboundReply.threadId} no longer exists — sent anyway, but thread history is now out of sync.`);
      }
    }
  } catch (err) {
    console.error("[agent/approve] Send failed after approval:", err);
    return htmlResponse("Approved, but sending failed. Check server logs — the prospect has not received this reply.", 500);
  }

  approval.status = "sent";
  await savePendingApproval(approval);
  return htmlResponse("Approved and sent to the prospect.");
}
