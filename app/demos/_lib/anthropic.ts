// Server-only helper for demo API routes. Reuses the shared Anthropic client
// (lib/anthropic.ts) — import this ONLY from route handlers, never from client components.
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
