// Durable capture for build-log email subscribers — see
// app/api/subscribe/route.ts and components/BuildLogSubscribe.tsx.
//
// There is no ESP/CRM wired up for this site (no Mailchimp/ConvertKit
// account exists) and standing up one is a service/credential decision,
// not a code one — so this deliberately does NOT build a mailing list or
// an automated send pipeline. It closes the audit's specific "nothing
// accumulates: no capture, no list, no return path" finding (G-42) at the
// cheapest honest scope: capture the email, notify the founder durably,
// same three-channel discipline as lib/contact-log.ts (console -> ephemeral
// Vercel Runtime Logs; local JSONL -> gitignored dev convenience, expected
// to no-op on Vercel's read-only/ephemeral fs; a durable notification email
// via the existing Gmail SMTP transport -- no new signup, no new
// credential). The founder's inbox is the list until an ESP decision is
// made; each subscribe is individually searchable/exportable from there.
import { promises as fs } from "fs";
import path from "path";
import { sendBuildLogSubscribeEmail } from "./email";

export interface SubscriberLogEntry {
  timestamp: string;
  ip: string;
  email: string;
}

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "build-log-subscribers.jsonl");

export async function appendSubscriberLog(entry: SubscriberLogEntry): Promise<void> {
  // Channel 1 — always runs, but ephemeral (see file header).
  console.log("[build-log-subscribe]", JSON.stringify(entry));

  // Channel 2 — local-dev convenience only, see file header.
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    await fs.appendFile(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch (err) {
    console.error("[build-log-subscribe] local-file write failed (expected on Vercel):", err);
  }

  // Channel 3 — the actual durable record, see file header.
  try {
    await sendBuildLogSubscribeEmail(entry);
  } catch (err) {
    console.error("[build-log-subscribe] durable email channel failed:", err);
  }
}
