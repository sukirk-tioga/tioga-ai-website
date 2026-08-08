import { anthropic } from "@/lib/anthropic";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendInquiryEmail } from "@/lib/email";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
 const ip = getClientIp(req);
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

 const prompt = `You are an AI classifier for Tioga AI, a solo-founder AI implementation practice run by Sukir Kumaresan. Analyze this inbound inquiry and classify it.

Inquiry details:
- Name: ${name}
- Company: ${company}
- Email: ${email}
- Project Description: ${description}

Tioga AI runs three practices, thirteen priced engagements underneath them:
1. Automate finance and operations - AI Operations Assessment, AI Agent Pilot
2. Modernize ERP with an agent layer - Agent-Ready ERP Diagnostic & Governed Write-Path, Legacy System AI Augmentation, ERP Modernization Advisory
3. Govern enterprise AI - AI Governance Readiness Assessment, AI Cost & Model Governance Assessment, AI Governance Evidence Package for Insurance Underwriting, Agentic AI Governance Framework, Multi-State AI Compliance Program, ISO 42001 Implementation Sprint, EU AI Act Conformity Program, Fractional AI Governance Officer

Respond ONLY with a JSON object in this exact format:
{
 "service": "one of: Automate finance and operations | Modernize ERP with an agent layer | Govern enterprise AI",
 "urgency": "one of: low | medium | high | critical",
 "complexity": "one of: small | medium | large | enterprise",
 "summary": "one sentence summarizing what they need",
 "nextStep": "one concrete recommended next action for Sukir",
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
