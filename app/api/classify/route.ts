import { anthropic } from "@/lib/anthropic";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendInquiryEmail } from "@/lib/email";
import { appendContactLog } from "@/lib/contact-log";
import { validateClassification } from "@/lib/classification";
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

 const prompt = `You are an AI classifier for Tioga AI, a solo-founder AI implementation practice. Analyze this inbound inquiry and classify it.

Inquiry details:
- Name: ${name}
- Company: ${company}
- Email: ${email}
- Project Description: ${description}

Tioga AI runs three practices, sixteen priced engagements underneath them:
1. Automate finance and operations - AI Operations Assessment, AI Agent Pilot
2. Modernize ERP with an agent layer - Agent-Ready ERP Diagnostic & Governed Write-Path, Salesforce Governed Write-Path & Evidence Build, Legacy System AI Augmentation, ERP Modernization Advisory
3. Govern enterprise AI - AI Governance Readiness Assessment, AI Cost & Model Governance Assessment, AI Governance Evidence Package for Insurance Underwriting, Agentic AI Governance Framework, Multi-State AI Compliance Program, ISO 42001 Implementation Sprint, EU AI Act Conformity Program, Fractional AI Governance Officer

Respond ONLY with a JSON object in this exact format:
{
 "service": "one of: Automate finance and operations | Modernize ERP with an agent layer | Govern enterprise AI",
 "urgency": "one of: low | medium | high | critical",
 "complexity": "one of: small | medium | large | enterprise",
 "summary": "one sentence summarizing what they need",
 "nextStep": "one concrete recommended next action for the founder",
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
 const classification = validateClassification(JSON.parse(jsonMatch[0]));

 // Send email — must be awaited or serverless fn shuts down before it sends
 let notificationSent = true;
 try {
 await sendInquiryEmail({ name, email, company, description, classification });
 } catch (emailErr) {
 notificationSent = false;
 console.error("Email send failed:", emailErr);
 }

 // Must be awaited, same reason as sendInquiryEmail above: Vercel can freeze
 // the serverless execution context the instant this handler returns, which
 // would cut off channel 3's SMTP send mid-flight if this were fire-and-
 // forget (confirmed live 2026-08-21 — a `void` version here silently
 // dropped the audit email every time despite returning 200). Each channel
 // inside appendContactLog is still its own try/catch, so a channel 3
 // failure still can't break the actual classify response — see
 // lib/contact-log.ts for all three channels.
 await appendContactLog({
 timestamp: new Date().toISOString(),
 ip,
 request: { descriptionLength: description.length, hasCompany: Boolean(company) },
 classification,
 notificationSent,
 });

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
