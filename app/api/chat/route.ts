import { anthropic } from "@/lib/anthropic";
import { CHATBOT_SYSTEM_PROMPT } from "@/lib/prompts";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, 100);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again tomorrow." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = await req.json();

  // Limit conversation length
  if (!messages || messages.length > 40) {
    return new Response(JSON.stringify({ error: "Conversation too long. Please start a new chat." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Message count alone doesn't bound total input size — a single message
  // can still carry an arbitrarily large payload. Validate shape and length
  // per message at runtime rather than trusting the client-supplied type.
  const MAX_MESSAGE_CHARS = 4000;
  const isValidMessage = (m: unknown): m is { role: string; content: string } =>
    typeof m === "object" &&
    m !== null &&
    ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "assistant") &&
    typeof (m as { content?: unknown }).content === "string" &&
    (m as { content: string }).content.length <= MAX_MESSAGE_CHARS;

  if (!messages.every(isValidMessage)) {
    return new Response(JSON.stringify({ error: "Invalid message format or a message is too long." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Format messages for Anthropic (strip any extra fields)
  const formattedMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Create a streaming response using Anthropic SDK directly
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          system: CHATBOT_SYSTEM_PROMPT,
          messages: formattedMessages,
          stream: true,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            // Send in Vercel AI SDK format
            const chunk = `0:${JSON.stringify(event.delta.text)}\n`;
            controller.enqueue(encoder.encode(chunk));
          }
        }

        controller.enqueue(encoder.encode("d:{\"finishReason\":\"stop\"}\n"));
        controller.close();
      } catch (err) {
        console.error("Chat API error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
      "Cache-Control": "no-cache",
    },
  });
}
