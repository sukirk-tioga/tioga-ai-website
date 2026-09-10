import type { Metadata } from "next";
import SolutionPage, { SolutionContent } from "@/components/SolutionPage";

export const metadata: Metadata = {
  title: "AI Agents for Oracle Fusion Cloud ERP & EBS",
  description:
    "Governed AI agents for Oracle Fusion Cloud ERP and E-Business Suite — real REST/module integration, a governed write-path, and no rip-and-replace.",
  alternates: { canonical: "/solutions/oracle" },
  openGraph: {
    title: "AI Agents for Oracle Fusion Cloud ERP & EBS — Tioga AI",
    description: "Governed AI agents that work inside your existing Oracle Fusion Cloud ERP or EBS environment.",
  },
};

const content: SolutionContent = {
  slug: "oracle",
  eyebrow: "Oracle Fusion Cloud ERP & EBS",
  title: "AI agents for Oracle Fusion Cloud ERP & EBS — without the rip-and-replace",
  buyer:
    "CFOs, controllers, and IT leaders running Oracle Fusion Cloud ERP or Oracle E-Business Suite who need AI to work inside the system they already have — not a parallel platform that becomes a second source of truth.",
  problem:
    "Oracle Fusion Cloud ERP ships real REST APIs and its own AI Agent Studio — but its native agents don't give you one audit trail spanning your Fusion agents and everything else in your stack. EBS is the harder case: custom APIs, HTTP-Basic-Auth-only integration, and a security model that predates agentic AI mean most \"AI for ERP\" vendors stop at read-only dashboards.",
  outcome:
    "A governed AI agent running inside your Fusion Cloud ERP or EBS environment — reading real REST resources or modules, executing through your application's own logic layer, with one audit trail your control owners can review across both.",
  proof: [
    {
      label: "REST-native, and still needs a governance layer",
      detail:
        "Fusion Cloud ERP ships real REST APIs (Payables invoices and invoice holds among them) and Oracle's own AI Agent Studio — but Oracle's native agents don't give you a cross-system audit trail spanning Fusion and the rest of your stack. That's the gap this engagement closes, not the agents themselves.",
    },
    {
      label: "Built by an Oracle operator",
      detail:
        "Before founding Tioga AI, the founder managed ERP, HR, CRM, and business-reporting systems — including Oracle EBS — across four sister companies. That's operator-level fluency with how Oracle ERP actually gets used, not textbook API knowledge.",
    },
    {
      label: "Live AI-readiness demo",
      detail:
        "Try the Oracle Fusion Cloud AI-Readiness Assessment demo below — a real automated readiness scan running against sample data, not a mockup screenshot.",
    },
    {
      label: "Governed write-path, not just reads",
      detail:
        "The Agent-Ready ERP Diagnostic & Governed Write-Path engagement builds toward real write access — through Fusion's or EBS's own application logic layer, with policy enforcement, not a database bypass.",
    },
    {
      label: "No rip-and-replace",
      detail:
        "Every engagement extends your existing Oracle investment. Nothing here asks you to migrate off Fusion or EBS to get AI capability.",
    },
    {
      label: "A real gap in Oracle's own sanctioned EBS agent path",
      detail:
        "Oracle's own E-Business Suite Adapter documentation states HTTP Basic Auth is the only supported authentication for REST services — a single shared service account for every call, not per-user or per-agent identity. Fusion doesn't share this constraint (it's REST-native), but a Fusion deployment still has to actually configure agent-scoped roles to close the gap. See the full finding below.",
    },
  ],
  offers: [
    {
      name: "Agent-Ready ERP Diagnostic & Governed Write-Path",
      price: "$60–120K",
      duration: "~6 weeks",
      desc: "Assess one stalled agent-to-ERP write path, then build a governed version of it — executing through Fusion's or EBS's own logic layer, with policy enforcement and an audit-grade evidence trail your control owners can actually clear.",
    },
    {
      name: "Legacy System AI Augmentation",
      price: "$40–100K",
      duration: "8–16 weeks",
      desc: "Add AI capability to your existing Oracle Fusion Cloud ERP or EBS environment without replacing the underlying system — extending what works rather than ripping it out.",
    },
    {
      name: "ERP Modernization Advisory",
      price: "$15–25K/month",
      duration: "3–12 months",
      desc: "Ongoing strategic guidance for organizations modernizing Oracle Fusion Cloud ERP or EBS — with AI integration as a first-class requirement, including migration planning if that's part of your roadmap.",
    },
  ],
  faq: [
    {
      q: "Does this replace our Oracle instance?",
      a: "No. Every engagement builds AI capability on top of or alongside Fusion Cloud ERP or EBS — nothing here proposes migrating unless that's explicitly your goal.",
    },
    {
      q: "Can an AI agent actually write to Fusion or EBS safely?",
      a: "Yes, through the same application logic layer and approval workflows your human users go through — not direct database writes. The Governed Write-Path engagement is built specifically around this.",
    },
    {
      q: "We're already on Fusion Cloud ERP with Oracle's own AI Agent Studio — why would we need this?",
      a: "Oracle's native agents are scoped to Fusion itself. The gap is a single governed audit trail spanning those agents and everything else in your stack (non-Oracle systems, human approvals, incident response) — that's what this closes, not a competing agent framework.",
    },
    {
      q: "Do you need access to our production Oracle instance to start?",
      a: "No. The 5-day Discovery Sprint runs against sample data and your documented workflows first — production access, if needed, comes later and stays under your control.",
    },
  ],
  related: [
    { href: "/articles/oracle-ebs-agent-attribution-gap", label: "Read: the attribution gap in Oracle's own sanctioned EBS agent path" },
    { href: "/articles/migration-complexity-scoring", label: "Read: what actually drives Fusion Cloud ERP AI-agent readiness" },
    { href: "/solutions/governed-write-path", label: "Governed write-path deep dive" },
    { href: "/services", label: "See all engagements" },
  ],
  demoLink: { href: "/demos/fusion-ai-readiness-assessment", label: "Try the Fusion Cloud AI-readiness demo" },
};

export default function OracleSolutionPage() {
  return <SolutionPage content={content} />;
}
