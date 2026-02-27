import { anthropic } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`demo-email:${ip}`, 30);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429 });
  }

  const { email } = await req.json();
  if (!email || email.trim().length < 10) {
    return new Response(JSON.stringify({ error: "Email too short." }), { status: 400 });
  }

  const prompt = `You are an enterprise email triage AI. Analyze this email and classify it.

Email:
${email}

Respond ONLY with a JSON object:
{
  "category": "one of: Sales Inquiry | Support Request | Complaint | Partnership | Spam | Internal | Invoice | Legal",
  "urgency": "one of: low | medium | high | critical",
  "sentiment": "one of: positive | neutral | negative | frustrated | urgent",
  "routeTo": "one of: Sales Team | Support Team | Finance | Legal | Management | Spam Filter | HR",
  "summary": "one sentence summary of the email",
  "suggestedReply": "a professional 2-3 sentence draft reply appropriate for this email type and tone",
  "keyEntities": ["array", "of", "key", "names", "companies", "or", "topics", "mentioned"]
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Demo email error:", err);
    return new Response(JSON.stringify({ error: "Analysis failed." }), { status: 500 });
  }
}
