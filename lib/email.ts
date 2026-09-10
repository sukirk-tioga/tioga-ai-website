import nodemailer from "nodemailer";
import type { Classification } from "./classification";

// User-submitted form fields and model-generated text are interpolated
// directly into these HTML email bodies — escape before interpolation so a
// crafted name/company/description can't inject markup or links into a
// trusted-looking internal notification.
function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Sent to sukir.kumaresan@tioga.ai directly, not the hello@tioga.ai alias.
// Confirmed live 2026-09-09 while testing inquiry delivery end to end: an
// SMTP send authenticated as this same Workspace account, addressed to its
// own hello@tioga.ai alias, only lands in that account's Sent folder — it
// never loops back into Inbox, even after hours (verified against Feb 2026
// test emails to the alias that still show no INBOX label 7+ months later).
// A genuinely external sender emailing hello@tioga.ai directly (a prospect,
// or a personal-account test) does land in Inbox as expected — this is
// specifically a self-send-to-own-alias quirk. Every founder-facing
// notification in this file targets the primary address for that reason;
// hello@tioga.ai stays the right public-facing/reply-to address since real
// replies to it are genuine external sends.
export async function sendInquiryEmail({
  name,
  email,
  company,
  description,
  classification,
}: {
  name: string;
  email: string;
  company: string;
  description: string;
  classification: Classification;
}) {
  const urgencyEmoji = {
    low: "🟢",
    medium: "🟡",
    high: "🟠",
    critical: "🔴",
  }[classification.urgency] ?? "⚪";

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #00D4FF, #0066CC); padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">New Inquiry — Tioga AI</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Respond ${classification.responseTime}</p>
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 12px;">Contact Details</h2>
        <p style="margin: 4px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p style="margin: 4px 0;"><strong>Company:</strong> ${company ? escapeHtml(company) : "Not provided"}</p>
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 12px;">Project Description</h2>
        <p style="margin: 0; color: #334155; line-height: 1.6;">${escapeHtml(description)}</p>
      </div>

      <div style="background: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
        <h2 style="font-size: 14px; text-transform: uppercase; color: #00D4FF; margin: 0 0 16px;">🤖 AI Classification</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px; width: 40%;">Service Match</td>
            <td style="padding: 6px 0; color: white; font-size: 13px; font-weight: 600;">${escapeHtml(classification.service)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Urgency</td>
            <td style="padding: 6px 0; color: white; font-size: 13px;">${urgencyEmoji} ${escapeHtml(classification.urgency.charAt(0).toUpperCase() + classification.urgency.slice(1))}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Project Size</td>
            <td style="padding: 6px 0; color: white; font-size: 13px;">${escapeHtml(classification.complexity)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Fit Score</td>
            <td style="padding: 6px 0; color: white; font-size: 13px;">${classification.fitScore}/10</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Summary</td>
            <td style="padding: 6px 0; color: white; font-size: 13px;">${escapeHtml(classification.summary)}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 12px; background: #00D4FF15; border-radius: 6px; border: 1px solid #00D4FF30;">
          <p style="margin: 0; font-size: 13px; color: #00D4FF; font-weight: 600;">Recommended Next Step</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">${escapeHtml(classification.nextStep)}</p>
        </div>
      </div>

      <p style="text-align: center; font-size: 12px; color: #94a3b8; margin: 0;">Sent by Tioga AI Smart Contact Form</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Tioga AI" <${process.env.SMTP_USER}>`,
    to: "sukir.kumaresan@tioga.ai",
    replyTo: email,
    subject: `[${urgencyEmoji} ${classification.urgency.toUpperCase()}] New Inquiry: ${classification.service} — ${name}${company ? ` (${company})` : ""}`,
    html,
  });
}

// Durable home for the contact-classifier's audit log — see lib/contact-log.ts
// for why this channel exists (Vercel Runtime Logs retain 1hr/1day, too short
// for the record's own liability-defense purpose; see
// strategy/agentic-operating-model-2026-08-19.md §5.7). Carries exactly the
// same shape-only fields as the console.log channel — no raw name/email/
// description text — so the PII boundary /trust's retention claim depends on
// stays intact. Best-effort: a failure here must never break the classify
// request, same discipline as sendInquiryEmail's own caller.
export async function sendContactLogEmail(entry: {
  timestamp: string;
  ip: string;
  request: { descriptionLength: number; hasCompany: boolean };
  classification: Classification;
  notificationSent: boolean;
}) {
  const html = `
    <div style="font-family: monospace; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 8px; font-size: 13px;">
      <h2 style="font-size: 14px; color: #64748b; margin: 0 0 12px;">Contact-classifier audit record</h2>
      <pre style="white-space: pre-wrap; word-break: break-word; background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin: 0; color: #334155;">${escapeHtml(JSON.stringify(entry, null, 2))}</pre>
      <p style="font-size: 11px; color: #94a3b8; margin: 12px 0 0;">Durable copy of the same shape-only record written to Vercel Runtime Logs (which expire in 1hr/1day) — see lib/contact-log.ts.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Tioga AI Audit Log" <${process.env.SMTP_USER}>`,
    to: "sukir.kumaresan@tioga.ai",
    subject: `[contact-log] ${entry.timestamp}`,
    html,
  });
}

interface FusionReadinessAssessment {
  readinessScore: number;
  scoreReasoning: string;
  keyGaps: { title: string; detail: string }[];
  recommendedApproach: { approach: string; reasoning: string };
  nextSteps: string[];
}

// Replaces sendMigrationAssessmentCopy (retired with the migration-assessment
// demo, 2026-09-10) — same email-delivery shape, new Fusion Cloud ERP
// AI-agent-readiness domain. See app/api/demos/fusion-ai-readiness-assessment/route.ts.
export async function sendFusionReadinessCopy({
  to,
  useCase,
  transactionVolume,
  integrationMethod,
  assessment,
}: {
  to: string;
  useCase: string;
  transactionVolume: string;
  integrationMethod: string;
  assessment: FusionReadinessAssessment;
}) {
  const gapRows = assessment.keyGaps
    .map(
      (r) => `
      <div style="padding: 12px 0; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px; font-weight: 600; color: #b45309;">${escapeHtml(r.title)}</p>
        <p style="margin: 0; font-size: 13px; color: #334155;">${escapeHtml(r.detail)}</p>
      </div>`
    )
    .join("");

  const nextSteps = assessment.nextSteps.map((s) => `<li style="margin-bottom: 4px;">${escapeHtml(s)}</li>`).join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #00D4FF, #0066CC); padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Your Oracle Fusion Cloud AI-Readiness Assessment</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">${escapeHtml(useCase)}</p>
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 8px;"><strong>Transaction volume:</strong> ${escapeHtml(transactionVolume)}</p>
        <p style="margin: 0 0 8px;"><strong>Current integration method:</strong> ${escapeHtml(integrationMethod)}</p>
        <p style="margin: 0 0 8px;"><strong>Readiness score:</strong> ${assessment.readinessScore}/10</p>
        <p style="margin: 0; color: #334155;">${escapeHtml(assessment.scoreReasoning)}</p>
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 8px;">Key Gaps To Close</h2>
        ${gapRows}
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 8px;">Recommended Approach: ${escapeHtml(assessment.recommendedApproach.approach)}</h2>
        <p style="margin: 0 0 12px; color: #334155;">${escapeHtml(assessment.recommendedApproach.reasoning)}</p>
        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 8px;">Next Steps</h2>
        <ul style="margin: 0; padding-left: 18px; color: #334155;">${nextSteps}</ul>
      </div>

      <p style="text-align: center; font-size: 12px; color: #94a3b8; margin: 0;">
        This is a sample assessment generated by the Tioga AI demo. Reply to this
        email if you'd like to talk through a real one.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Tioga AI" <${process.env.SMTP_USER}>`,
    to,
    replyTo: "hello@tioga.ai",
    subject: `Your Oracle Fusion Cloud AI-readiness assessment — ${useCase}`,
    html,
  });
}

// The actual outbound send for the email agent (app/api/classify/route.ts's
// first reply, app/api/agent/inbound/route.ts's follow-ups). As of the
// human-approval-hold fix, neither caller invokes this directly anymore —
// both draft the reply and route it through lib/agent-approval.ts +
// sendAgentReplyApprovalEmail() first. This function is now only called
// from app/api/agent/approve/route.ts, after a founder has approved the
// specific draft AND AGENT_EMAIL_AUTOSEND_ENABLED="true". Reuses the same
// Gmail SMTP transport as every other outbound send in this file — no new
// outbound provider added alongside Postmark's inbound-only role here (see
// PR description for that call). Plain text, not HTML: this is meant to
// read as a real one-to-one email from the practice, not a templated
// notification.
//
// Reply-To is set to reply+{threadId}@agent.tioga.ai so a prospect's reply
// round-trips through Postmark's Inbound Parse webhook with the thread ID
// recoverable from the recipient address (see lib/postmark-inbound.ts).
// Every send is BCC'd to the founder's primary address as a passive audit
// trail, mirroring the existing appendContactLog audit discipline. BCC'd
// to sukir.kumaresan@tioga.ai rather than the hello@tioga.ai alias — a
// self-send from this same SMTP account to its own alias only lands in
// Sent, not Inbox (confirmed live 2026-09-09; see the comment on
// sendInquiryEmail's `to` for the full story).
export async function sendAgentEmail({
  to,
  subject,
  text,
  threadId,
}: {
  to: string;
  subject: string;
  text: string;
  threadId: string;
}) {
  await transporter.sendMail({
    from: `"Tioga AI" <${process.env.SMTP_USER}>`,
    to,
    replyTo: `reply+${threadId}@agent.tioga.ai`,
    bcc: "sukir.kumaresan@tioga.ai",
    subject,
    text,
  });
}

// Human-approval hold for the autonomous email agent: sent to the founder
// instead of the prospect ever seeing the drafted reply directly (see
// lib/agent-approval.ts for why). Carries the full drafted subject/body so
// the founder can actually read what's about to go out, plus two links to
// app/api/agent/approve/route.ts that resolve the hold — an unguessable
// approval-id token in the URL is the auth mechanism (same bearer-capability
// pattern this codebase already uses for reply+{threadId}@agent.tioga.ai
// thread recovery), not a separate login. Approving still doesn't send
// anything unless AGENT_EMAIL_AUTOSEND_ENABLED="true" — see that route.
export async function sendAgentReplyApprovalEmail({
  approvalId,
  prospectEmail,
  prospectName,
  draftSubject,
  draftBody,
  baseUrl = "https://tioga.ai",
}: {
  approvalId: string;
  prospectEmail: string;
  prospectName: string;
  draftSubject: string;
  draftBody: string;
  baseUrl?: string;
}) {
  const approveUrl = `${baseUrl}/api/agent/approve?id=${encodeURIComponent(approvalId)}&action=approve`;
  const rejectUrl = `${baseUrl}/api/agent/approve?id=${encodeURIComponent(approvalId)}&action=reject`;

  await transporter.sendMail({
    from: `"Tioga AI Agent" <${process.env.SMTP_USER}>`,
    to: "sukir.kumaresan@tioga.ai",
    subject: `[APPROVE REPLY] ${draftSubject}`,
    text: `The email agent drafted a reply to ${prospectName || "(no name)"} <${prospectEmail}> and is holding it for your approval before sending.\n\n--- Draft subject ---\n${draftSubject}\n\n--- Draft body ---\n${draftBody}\n\nApprove and send: ${approveUrl}\n\nReject (do not send): ${rejectUrl}\n\nNote: even after approving, nothing sends unless AGENT_EMAIL_AUTOSEND_ENABLED is set to "true" in the deployment environment.`,
  });
}

// A direct, non-BCC notification to hello@tioga.ai used only when a thread
// needs a founder's attention (the 6-reply safety cap in
// app/api/agent/inbound/route.ts). A true BCC can't carry a different
// subject line for the BCC'd recipient than the one the prospect sees, so
// this is a second, separate send specifically so the flagged subject
// (`[NEEDS FOUNDER] ...`) is what actually shows up in the inbox, not
// buried inside an identical-subject BCC copy.
export async function sendFounderAlertEmail({
  subject,
  note,
  threadId,
  prospectEmail,
}: {
  subject: string;
  note: string;
  threadId: string;
  prospectEmail: string;
}) {
  await transporter.sendMail({
    from: `"Tioga AI Agent" <${process.env.SMTP_USER}>`,
    to: "sukir.kumaresan@tioga.ai",
    subject: `[NEEDS FOUNDER] ${subject}`,
    text: `${note}\n\nThread: ${threadId}\nProspect: ${prospectEmail}`,
  });
}

// Durable home for build-log email-capture subscribers — see
// lib/subscriber-log.ts for why this channel exists (no ESP/CRM is wired
// up for this site; the founder's inbox is the list until that decision is
// made). Reuses the same Gmail SMTP transport as every other outbound send
// in this file — no new provider, no new credential.
export async function sendBuildLogSubscribeEmail(entry: {
  timestamp: string;
  ip: string;
  email: string;
}) {
  await transporter.sendMail({
    from: `"Tioga AI" <${process.env.SMTP_USER}>`,
    to: "sukir.kumaresan@tioga.ai",
    replyTo: entry.email,
    subject: `[build-log subscribe] ${entry.email}`,
    text: `New build-log subscriber.\n\nEmail: ${entry.email}\nTime: ${entry.timestamp}\nIP: ${entry.ip}`,
  });
}
