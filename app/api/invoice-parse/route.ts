import { anthropic } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`invoice:${ip}`, 30);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429 });
  }

  const { text } = await req.json();
  if (!text || text.trim().length < 20) {
    return new Response(JSON.stringify({ error: "Invoice text too short." }), { status: 400 });
  }

  const prompt = `You are an invoice data extraction AI. Extract all structured data from this invoice.

Invoice:
${text.slice(0, 3000)}

Respond ONLY with a JSON object:
{
  "vendor": "vendor/supplier name",
  "invoiceNumber": "invoice number or ID",
  "invoiceDate": "invoice date",
  "dueDate": "payment due date",
  "poNumber": "purchase order number if present, else N/A",
  "lineItems": [{"description": "item description", "amount": "formatted dollar amount"}],
  "subtotal": "subtotal amount",
  "tax": "tax amount",
  "total": "total amount due",
  "paymentInstructions": "payment method and details",
  "confidence": 95
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
    console.error("Invoice parse error:", err);
    return new Response(JSON.stringify({ error: "Extraction failed." }), { status: 500 });
  }
}
