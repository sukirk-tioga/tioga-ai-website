// Server-only helper for demo API routes. Reuses the shared Anthropic client
// (lib/anthropic.ts) — import this ONLY from route handlers, never from client components.
//
// Note: a tool-use "structured output" variant was tried here on 2026-08-06
// to make migration-assessment's JSON output more reliable, but testing
// showed Anthropic tool-use is schema-guided, not schema-enforced — it
// failed to respect a nested array-of-objects schema on the majority of
// calls (dumping XML-tagged text into a string field instead), which was
// LESS reliable than free-text JSON.parse() had been in a week of real
// production traffic. Deliberately not reintroducing it — if a future
// caller wants structured output, validate + retry on the raw JSON path
// below rather than assuming forced tool_choice guarantees shape.
import { anthropic } from "@/lib/anthropic";

const DEMO_MODEL = "claude-sonnet-5";

export async function callClaude(opts: {
  prompt: string;
  system?: string;
  maxTokens?: number;
}): Promise<string> {
  const response = await anthropic.messages.create({
    model: DEMO_MODEL,
    max_tokens: opts.maxTokens ?? 1500,
    thinking: { type: "disabled" },
    ...(opts.system ? { system: opts.system } : {}),
    messages: [{ role: "user", content: opts.prompt }],
  });
  return response.content[0]?.type === "text" ? response.content[0].text : "";
}
