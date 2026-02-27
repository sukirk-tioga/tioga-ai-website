import { anthropic } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`demo-doc:${ip}`, 30);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429 });
  }

  const { text } = await req.json();
  if (!text || text.trim().length < 20) {
    return new Response(JSON.stringify({ error: "Document too short." }), { status: 400 });
  }

  const prompt = `You are an enterprise document classification AI. Analyze this document.

Document:
${text.slice(0, 3000)}

Respond ONLY with a JSON object:
{
  "documentType": "one of: Contract | Invoice | Purchase Order | Resume | Legal Brief | Policy Document | Report | Memo | NDA | Proposal | Receipt | Email | Other",
  "confidence": "a number 0-100 representing classification confidence",
  "summary": "2-3 sentence summary of the document",
  "keyEntities": {
    "people": ["names mentioned"],
    "organizations": ["companies or orgs mentioned"],
    "dates": ["important dates mentioned"],
    "amounts": ["monetary amounts if any"]
  },
  "suggestedActions": ["array of 2-3 recommended next actions"],
  "riskFlags": ["any concerning items to flag, empty array if none"],
  "department": "which department should own this: Finance | Legal | HR | Operations | Sales | Management"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Demo doc error:", err);
    return new Response(JSON.stringify({ error: "Analysis failed." }), { status: 500 });
  }
}
