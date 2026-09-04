// Generates the email agent's next reply in a thread. Mirrors
// lib/classification.ts's discipline: the model's output is JSON, and it's
// runtime-validated before anything downstream (an actual outbound email)
// is allowed to trust it.
import { anthropic } from "./anthropic";
import { EMAIL_AGENT_SYSTEM_PROMPT } from "./agent-prompts";
import type { AgentMessage, AgentThread } from "./thread-store";

export interface AgentReply {
  subject: string;
  body: string;
}

const MAX_SUBJECT_LEN = 200;
const MAX_BODY_LEN = 6000;

function validateAgentReply(raw: unknown): AgentReply {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Agent reply response was not an object.");
  }
  const r = raw as Record<string, unknown>;
  if (typeof r.subject !== "string" || r.subject.trim().length === 0) {
    throw new Error("Agent reply missing subject.");
  }
  if (typeof r.body !== "string" || r.body.trim().length === 0) {
    throw new Error("Agent reply missing body.");
  }
  return {
    subject: r.subject.trim().slice(0, MAX_SUBJECT_LEN),
    body: r.body.trim().slice(0, MAX_BODY_LEN),
  };
}

// Builds the conversation-history block the model sees. Kept as a single
// text turn rather than mapping to Anthropic's own user/assistant message
// array — the "prospect"/"agent" roles here don't map cleanly to that (the
// agent's own prior replies aren't "assistant" turns responding to
// nothing-in-particular, they're prior emails), and a single formatted
// transcript is easier to keep in strict chronological order.
function formatHistory(messages: AgentMessage[]): string {
  return messages
    .map((m) => `[${m.timestamp}] ${m.role === "prospect" ? "Prospect" : "Tioga AI (you, prior reply)"}:\n${m.text}`)
    .join("\n\n---\n\n");
}

export async function generateAgentReply(thread: {
  prospectName: string;
  company: string;
  classification: AgentThread["classification"];
  subject: string;
  messages: AgentMessage[];
}): Promise<AgentReply> {
  const userPrompt = `Thread subject: ${thread.subject}

Prospect: ${thread.prospectName || "(name not given)"}${thread.company ? ` — ${thread.company}` : ""}

Original classification of this inquiry:
- Service area: ${thread.classification.service}
- Urgency: ${thread.classification.urgency}
- Complexity: ${thread.classification.complexity}
- Summary: ${thread.classification.summary}
- Fit score: ${thread.classification.fitScore}/10

Full conversation so far, oldest first:

${formatHistory(thread.messages)}

Write the next reply, responding to the prospect's most recent message. Output the JSON object described in your instructions and nothing else.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1200,
    system: EMAIL_AGENT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in agent reply response.");
  return validateAgentReply(JSON.parse(jsonMatch[0]));
}
