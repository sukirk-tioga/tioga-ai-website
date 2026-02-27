import { anthropic } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Mock enterprise data our "MCP server" exposes
const MOCK_MCP_DATA = {
 workday: {
 employees: [
 { id: "EMP-4821", name: "Sarah Chen", dept: "Engineering", title: "Sr. Engineer", status: "Active", location: "San Francisco" },
 { id: "EMP-3301", name: "James Whitfield", dept: "Operations", title: "VP Operations", status: "Active", location: "Chicago" },
 { id: "EMP-5512", name: "Rachel Donovan", dept: "Technology", title: "CTO", status: "Active", location: "New York" },
 ],
 openReqs: 3,
 headcount: 847,
 },
 salesforce: {
 opportunities: [
 { id: "OPP-9921", company: "Meridian Logistics", value: "$120,000", stage: "Proposal", closeDate: "2026-03-31" },
 { id: "OPP-8801", company: "Apex Systems", value: "$85,000", stage: "Negotiation", closeDate: "2026-02-28" },
 ],
 pipelineTotal: "$2.4M",
 wonThisQuarter: "$340K",
 },
 sap: {
 invoices: [
 { id: "INV-2026-0892", vendor: "CloudStack Ltd", amount: "$8,831.90", status: "Pending Approval", due: "2026-03-03" },
 { id: "INV-2026-0881", vendor: "Apex Software", amount: "$38,626.00", status: "Approved", due: "2026-03-17" },
 ],
 pendingApprovals: 12,
 monthlySpend: "$284,000",
 },
};

export async function POST(req: NextRequest) {
 const ip = req.headers.get("x-forwarded-for") ?? "unknown";
 const { allowed } = rateLimit(`mcp-demo:${ip}`, 20);
 if (!allowed) {
 return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429 });
 }

 const { query } = await req.json();
 if (!query?.trim()) {
 return new Response(JSON.stringify({ error: "Query required." }), { status: 400 });
 }

 const systemPrompt = `You are Claude, an AI assistant connected to Tioga AI's enterprise systems via MCP (Model Context Protocol). You have access to the following live data:

**Workday (HR)**:
${JSON.stringify(MOCK_MCP_DATA.workday, null, 2)}

**Salesforce (CRM)**:
${JSON.stringify(MOCK_MCP_DATA.salesforce, null, 2)}

**SAP (Finance)**:
${JSON.stringify(MOCK_MCP_DATA.sap, null, 2)}

Answer the user's question using this data. Be specific and cite actual values. Keep responses concise (2-4 sentences). 
Also return a JSON block at the end of your response showing which MCP tool(s) you called, in this format:
<mcp_calls>
{"tools": ["Workday::getEmployees" | "Salesforce::getOpportunities" | "SAP::getInvoices"], "system": "which system(s) you queried"}
</mcp_calls>`;

 try {
 const response = await anthropic.messages.create({
 model: "claude-haiku-4-5-20251001",
 max_tokens: 400,
 system: systemPrompt,
 messages: [{ role: "user", content: query }],
 });

 const fullText = response.content[0].type === "text" ? response.content[0].text : "";

 // Extract MCP calls metadata
 const mcpMatch = fullText.match(/<mcp_calls>([\s\S]*?)<\/mcp_calls>/);
 let mcpCalls = { tools: ["Enterprise System"], system: "Enterprise" };
 if (mcpMatch) {
 try { mcpCalls = JSON.parse(mcpMatch[1].trim()); } catch { /* use default */ }
 }

 const answer = fullText.replace(/<mcp_calls>[\s\S]*?<\/mcp_calls>/, "").trim();

 return new Response(JSON.stringify({ answer, mcpCalls }), {
 status: 200,
 headers: { "Content-Type": "application/json" },
 });
 } catch (err) {
 console.error("MCP demo error:", err);
 return new Response(JSON.stringify({ error: "Demo failed." }), { status: 500 });
 }
}
