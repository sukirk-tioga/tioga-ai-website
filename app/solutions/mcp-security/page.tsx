import type { Metadata } from "next";
import SolutionPage, { SolutionContent } from "@/components/SolutionPage";

export const metadata: Metadata = {
  title: "MCP Security",
  description:
    "MCP standardizes how an agent talks to a tool. It doesn't give you scoped permissions, audit logging, or policy enforcement by default — this does.",
  alternates: { canonical: "/solutions/mcp-security" },
  openGraph: {
    title: "MCP Security — Tioga AI",
    description: "Scoped permissions, call-level audit logging, and policy enforcement for MCP-based agent integrations.",
  },
};

const content: SolutionContent = {
  slug: "mcp-security",
  eyebrow: "MCP Security",
  title: "MCP gives agents a standard interface. It doesn't give them security by default.",
  buyer:
    "Security and compliance reviewers evaluating an MCP-based AI integration who need to know what's actually enforced — not just what protocol it technically supports.",
  problem:
    "MCP standardizes how an agent talks to a tool. It says nothing about who's allowed to call what, what gets logged, or what happens when an agent asks for something it shouldn't have. Vendors selling \"MCP integration\" rarely address any of that.",
  outcome:
    "An MCP integration with scoped permissions per tool, call-level audit logging, and policy enforcement — reviewed the way your security team actually reviews a system, not glossed over as \"it's just an API.\"",
  proof: [
    {
      label: "Scoped by design",
      detail:
        "Every MCP integration Tioga builds allow-lists exactly which tools an agent can call — an agent that can read invoices doesn't automatically get write access to your GL.",
    },
    {
      label: "Every MCP integration on this site is real",
      detail:
        "See the MCP page for the actual pattern — before/after comparisons and live tool-calling, not a diagram.",
    },
    {
      label: "Built by an operator, not just a security vendor",
      detail:
        "Sukir's background managing real ERP/CRM/HR systems means the permission boundaries are scoped around how these systems actually get misused, not a generic checklist.",
    },
    {
      label: "No \"trust the vendor\" black box",
      detail:
        "Call-level audit logging — input, output, and which policy check ran — is the standard every integration is built around, not an optional add-on you have to ask for.",
    },
  ],
  offers: [
    {
      name: "AI Operations Assessment",
      price: "$10–15K",
      duration: "2–3 weeks",
      desc: "The right starting point to scope an MCP security review or a new integration's permission model — maps what needs access to what, ranked by risk and feasibility.",
    },
    {
      name: "Legacy System AI Augmentation",
      price: "$40–100K",
      duration: "8–16 weeks",
      desc: "Add a governed MCP integration to your existing systems with scoped permissions and audit logging built in from the start.",
    },
  ],
  faq: [
    {
      q: "Is MCP itself secure?",
      a: "MCP is a protocol for how an agent talks to a tool — it doesn't define authentication, authorization, or audit logging for you. Those have to be built around it, which is exactly what this engagement scopes.",
    },
    {
      q: "What does \"scoped permissions\" mean in practice?",
      a: "Each tool an agent can call is explicitly allow-listed with its own permission boundary — an agent that can read invoices doesn't automatically get write access to your GL, for example.",
    },
    {
      q: "Do you log every tool call?",
      a: "Yes — call-level audit logging with input and output is the standard Tioga builds every MCP integration around, not an optional add-on.",
    },
    {
      q: "We already have an MCP integration built by another vendor — can you review it?",
      a: "Yes, a security review of an existing MCP integration is a fit for the Discovery Sprint, scoped to audit rather than build.",
    },
  ],
  related: [
    { href: "/mcp", label: "What is MCP, and how Tioga uses it" },
    { href: "/mcp/vs-custom-integration", label: "MCP vs. custom integration" },
    { href: "/articles/mcp-scoped-permissions", label: "Read: MCP still needs the same approval gates" },
    { href: "/trust", label: "See the Trust Center" },
  ],
  demoLink: { href: "/mcp", label: "See how Tioga's MCP integration works" },
};

export default function McpSecuritySolutionPage() {
  return <SolutionPage content={content} />;
}
