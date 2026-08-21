// Structured audit log for the contact-form classifier — the site's own
// "highest-risk agent by blast radius, least-governed by instrumentation"
// (see /trust#ai-use and the 2026-08-16 agentic-business-ops master plan
// §5.1 item 0.7). Every classify request logs what was submitted (shape
// only — no raw name/email/description text, so this doesn't create a
// second PII record beyond the founder's inbox, which the Privacy Policy
// already discloses as "the record" for contact-form submissions) and
// exactly what the schema-validated classifier returned.
//
// Three channels, all best-effort/non-blocking — a logging failure here must
// never break the contact-form request:
//
// 1. console.log — Vercel captures stdout/stderr from every serverless
//    invocation into its Runtime Logs (dashboard + `vercel logs`) — but
//    those retain only 1hr (Hobby) / 1day (Pro), too short for this
//    record's actual purpose (see 3). Matches this repo's existing
//    `console.error("[tag]", ...)` convention (see app/api/*/route.ts).
// 2. A local-only JSONL append to ./logs/ (gitignored) — a convenience for
//    reading recent entries during local dev without scrolling terminal
//    output. Vercel's serverless filesystem is ephemeral and, depending on
//    runtime, may be read-only — this write is expected to no-op or fail
//    silently in production.
// 3. sendContactLogEmail (lib/email.ts) — the actual durable home, added
//    2026-08-20 per strategy/agentic-operating-model-2026-08-19.md §5.7:
//    "give the contact-classifier's audit log a durable home." Reuses the
//    same proven Gmail SMTP transport as sendInquiryEmail — no new signup,
//    no new credential. Carries the exact same shape-only fields as (1),
//    preserving the PII boundary /trust's retention claim depends on.
import { promises as fs } from "fs";
import path from "path";
import type { Classification } from "./classification";
import { sendContactLogEmail } from "./email";

export interface ContactLogEntry {
  timestamp: string;
  ip: string;
  request: {
    descriptionLength: number;
    hasCompany: boolean;
  };
  classification: Classification;
  notificationSent: boolean;
}

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "contact-submissions.jsonl");

export async function appendContactLog(entry: ContactLogEntry): Promise<void> {
  // Channel 1 — always runs, but ephemeral (see file header).
  console.log("[contact-log]", JSON.stringify(entry));

  // Channel 2 — local-dev convenience only, see file header.
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    await fs.appendFile(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch (err) {
    // Never let logging failures affect the actual request. Expected to
    // fire on Vercel's read-only/ephemeral fs — that's fine, channel 1
    // already captured this entry.
    console.error("[contact-log] local-file write failed (expected on Vercel):", err);
  }

  // Channel 3 — the actual durable record, see file header.
  try {
    await sendContactLogEmail(entry);
  } catch (err) {
    console.error("[contact-log] durable email channel failed:", err);
  }
}
