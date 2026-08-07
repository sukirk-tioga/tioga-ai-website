// Server-only helper for demo API routes. Reuses the shared Anthropic client
// (lib/anthropic.ts) — import this ONLY from route handlers, never from client components.
import { anthropic } from "@/lib/anthropic";
import type Anthropic from "@anthropic-ai/sdk";

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

// Structured-output variant: forces the model to respond via a single tool
// call constrained to `schema`. Anthropic tool-use is schema-guided, not
// schema-enforced (unlike e.g. OpenAI's strict JSON mode), so callers should
// still validate `toolUse.input` and consider retrying on a bad shape —
// this is much more reliable than free-text JSON.parse() but not a hard
// guarantee. Use this instead of callClaude() when the caller needs
// structured output back.
export async function callClaudeStructured<T = Record<string, unknown>>(opts: {
  prompt: string;
  system?: string;
  maxTokens?: number;
  toolName: string;
  toolDescription: string;
  schema: Record<string, unknown>;
}): Promise<T> {
  const response = await anthropic.messages.create({
    model: DEMO_MODEL,
    max_tokens: opts.maxTokens ?? 2500,
    thinking: { type: "disabled" },
    ...(opts.system ? { system: opts.system } : {}),
    messages: [{ role: "user", content: opts.prompt }],
    tools: [
      {
        name: opts.toolName,
        description: opts.toolDescription,
        input_schema: { type: "object", ...opts.schema } as Anthropic.Tool["input_schema"],
      },
    ],
    tool_choice: { type: "tool", name: opts.toolName },
  });

  console.error(`[callClaudeStructured] DEBUG stop_reason=${response.stop_reason} usage=${JSON.stringify(response.usage)}`);

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("model did not return a tool call");
  }
  return toolUse.input as T;
}
