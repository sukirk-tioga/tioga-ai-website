import { anthropic } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";
import { sendInquiryEmail } from "@/lib/email";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`classify:${ip}`, 20);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, email, company, description } = await req.json();

  if (!description || description.trim().length < 10) {
    return new Response(JSON.stringify({ error: "Description too short." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const prompt = `You are an AI classifier for Tioga AI, an enterprise AI implementation company. Analyze this inbound inquiry and classify it.

Inquiry details:
- Name: ${name}
- Company: ${company}
- Email: ${email}
- Project Description: ${description}

Tioga AI's services:
1. Custom AI Agents - automating workflows, intelligent agents, process automation
2. MCP Integrations - connecting LLMs to SAP, PeopleSoft, Salesforce, ServiceNow via Model Context Protocol
3. AI Strategy Consulting - discovery workshops, POC development, ROI analysis, roadmapping
4. AI Training & Enablement - team training, prompt engineering, AI governance

Respond ONLY with a JSON object in this exact format:
{
  "service": "one of: Custom AI Agents | MCP Integrations | AI Strategy Consulting | AI Training & Enablement",
  "urgency": "one of: low | medium | high | critical",
  "complexity": "one of: small | medium | large | enterprise",
  "summary": "one sentence summarizing what they need",
  "nextStep": "one concrete recommended next action for the Tioga AI team",
  "responseTime": "one of: within 4 hours | within 1 business day | within 2 business days",
  "fitScore": "a number 1-10 indicating how well this fits Tioga AI's services"
}

Base urgency on: timeline mentions, business-critical language, company size signals.
Base complexity on: scope, number of systems mentioned, enterprise vs SMB signals.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const classification = JSON.parse(jsonMatch[0]);

    // Send email — must be awaited or serverless fn shuts down before it sends
    try {
      await sendInquiryEmail({ name, email, company, description, classification });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    return new Response(JSON.stringify({ classification }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Classify error:", err);
    return new Response(JSON.stringify({ error: "Classification failed." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
