// Defensive parsing for Postmark's Inbound Parse Webhook payload.
//
// There's no live Postmark account for this repo yet (see PR description),
// so this can't be verified against a real webhook call. It's built
// against Postmark's documented Inbound Parse payload shape instead
// (https://postmarkapp.com/developer/webhooks/inbound-webhook) and tested
// with a realistic mocked payload matching that documented shape — see
// the note in the PR description about what is/isn't actually verified.
//
// Postmark POSTs substantially more fields than we use (Attachments, full
// Headers array, Cc/Bcc, etc.) — only pull out what the agent needs, and
// validate defensively rather than trusting the shape blindly, since this
// route's whole job is deciding whether to trigger an autonomous outbound
// send.

export interface ParsedInboundEmail {
  fromEmail: string;
  fromName: string;
  subject: string;
  // The actual new reply text, with quoted history/signature stripped
  // where Postmark could determine it (StrippedTextReply) — falls back to
  // the full TextBody (or a naive HTML-tag strip of HtmlBody) if Postmark
  // couldn't produce a stripped version, which happens for some mail
  // clients' quoting styles.
  body: string;
  messageId: string;
  // The `+{threadId}` portion of `reply+{threadId}@agent.tioga.ai`, if
  // present. Postmark populates this from the recipient address itself for
  // any inbound stream configured on a domain (not just their generated
  // pmail.com addresses) — see MailboxHash in the docs above.
  mailboxHash: string | null;
  // Every recipient address, in case MailboxHash is empty and the thread
  // ID has to be recovered from the raw To/OriginalRecipient field instead.
  toAddresses: string[];
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Postmark's `From`/`To` fields are a full mailbox string ("Name <a@b.com>"
// or bare "a@b.com"); `FromFull.Email`/`ToFull[].Email` are already split
// out when present, which is what we prefer. This is the fallback for when
// only the raw string is available.
function extractEmailAddress(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  const candidate = (match ? match[1] : raw).trim();
  return candidate;
}

/**
 * Parses and validates a raw Postmark Inbound Parse webhook body.
 * Throws on any payload that doesn't carry the minimum fields the agent
 * needs to act safely (sender, message id, some body text). Callers should
 * treat a throw as "reject this request" (400), not as a reason to
 * autonomously send anything.
 */
export function parseInboundPayload(raw: unknown): ParsedInboundEmail {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Inbound payload was not an object.");
  }
  const p = raw as Record<string, unknown>;

  const fromFull = typeof p.FromFull === "object" && p.FromFull !== null ? (p.FromFull as Record<string, unknown>) : null;
  const fromEmailRaw = isNonEmptyString(fromFull?.Email) ? (fromFull!.Email as string) : isNonEmptyString(p.From) ? (p.From as string) : null;
  if (!fromEmailRaw) {
    throw new Error("Inbound payload missing From/FromFull.Email.");
  }
  const fromEmail = extractEmailAddress(fromEmailRaw).toLowerCase();
  if (!fromEmail.includes("@")) {
    throw new Error(`Inbound payload From address doesn't look like an email: ${fromEmailRaw}`);
  }

  const fromName = isNonEmptyString(fromFull?.Name) ? (fromFull!.Name as string) : "";

  if (!isNonEmptyString(p.MessageID)) {
    throw new Error("Inbound payload missing MessageID.");
  }

  const subject = isNonEmptyString(p.Subject) ? (p.Subject as string) : "(no subject)";

  const strippedReply = isNonEmptyString(p.StrippedTextReply) ? (p.StrippedTextReply as string) : "";
  const textBody = isNonEmptyString(p.TextBody) ? (p.TextBody as string) : "";
  const htmlBody = isNonEmptyString(p.HtmlBody) ? (p.HtmlBody as string) : "";

  const body = strippedReply || textBody || (htmlBody ? stripHtml(htmlBody) : "");
  if (!isNonEmptyString(body)) {
    throw new Error("Inbound payload carried no usable body text (StrippedTextReply/TextBody/HtmlBody all empty).");
  }

  // MailboxHash is Postmark's own parsed-out `+hash` segment for the
  // recipient the mail was sent to. It's usually top-level, but fall back
  // to ToFull[].MailboxHash for defense in depth against payload variants.
  let mailboxHash: string | null = isNonEmptyString(p.MailboxHash) ? (p.MailboxHash as string) : null;

  const toAddresses: string[] = [];
  const toFull = Array.isArray(p.ToFull) ? p.ToFull : [];
  for (const entry of toFull) {
    if (typeof entry === "object" && entry !== null) {
      const e = entry as Record<string, unknown>;
      if (isNonEmptyString(e.Email)) toAddresses.push((e.Email as string).toLowerCase());
      if (!mailboxHash && isNonEmptyString(e.MailboxHash)) mailboxHash = e.MailboxHash as string;
    }
  }
  if (toAddresses.length === 0 && isNonEmptyString(p.To)) {
    for (const part of (p.To as string).split(",")) {
      const addr = extractEmailAddress(part);
      if (addr.includes("@")) toAddresses.push(addr.toLowerCase());
    }
  }
  if (toAddresses.length === 0 && isNonEmptyString(p.OriginalRecipient)) {
    toAddresses.push(extractEmailAddress(p.OriginalRecipient as string).toLowerCase());
  }

  return {
    fromEmail,
    fromName,
    subject,
    body: body.trim(),
    messageId: p.MessageID as string,
    mailboxHash,
    toAddresses,
  };
}

/**
 * Recovers the internal thread ID from a parsed inbound email. Prefers
 * Postmark's own MailboxHash; falls back to regexing `reply+{id}@` out of
 * any recipient address in case a payload variant omits MailboxHash.
 */
export function extractThreadId(email: ParsedInboundEmail): string | null {
  if (email.mailboxHash) return email.mailboxHash;
  for (const addr of email.toAddresses) {
    const match = addr.match(/^reply\+([A-Za-z0-9_-]+)@/i);
    if (match) return match[1];
  }
  return null;
}
