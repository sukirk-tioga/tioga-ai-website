// Structured audit log for the contact-form classifier — the site's own
// "highest-risk agent by blast radius, least-governed by instrumentation"
// (see /trust#ai-use and the 2026-08-16 agentic-business-ops master plan
// §5.1 item 0.7). Every classify request logs what was submitted (shape
// only — no raw name/email/description text, so this doesn't create a
// second PII record beyond the founder's inbox, which the Privacy Policy
// already discloses as "the record" for contact-form submissions) and
// exactly what the schema-validated classifier returned.
//
// Two channels, both best-effort/non-blocking — a logging failure here must
// never break the contact-form request:
//
// 1. console.log — the channel that actually works in production. Vercel
//    captures stdout/stderr from every serverless invocation into its
//    Runtime Logs (dashboard + `vercel logs`, drainable to a real log sink
//    later) — the standard structured-logging pattern for a stateless
//    Vercel function, and matches this repo's existing
//    `console.error("[tag]", ...)` convention (see app/api/*/route.ts).
// 2. A local-only JSONL append to ./logs/ (gitignored) — a convenience for
//    reading recent entries during local dev without scrolling terminal
//    output. Vercel's serverless filesystem is ephemeral and, depending on
//    runtime, may be read-only — this write is expected to no-op or fail
//    silently in production. It is NOT the production audit trail; (1) is.
import { promises as fs } from "fs";
import path from "path";
import type { Classification } from "./classification";

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
  // Channel 1 — always runs; this is what's actually visible in production.
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
}
