import type { Metadata } from "next";
import SolutionPage, { SolutionContent } from "@/components/SolutionPage";

export const metadata: Metadata = {
  title: "AI Agents for Oracle EBS",
  description:
    "Governed AI agents for Oracle E-Business Suite — real module integration, a governed write-path, and no rip-and-replace.",
  alternates: { canonical: "/solutions/oracle" },
  openGraph: {
    title: "AI Agents for Oracle EBS — Tioga AI",
    description: "Governed AI agents that work inside your existing Oracle EBS environment.",
  },
};

const content: SolutionContent = {
  slug: "oracle",
  eyebrow: "Oracle EBS",
  title: "AI agents for Oracle EBS — without the rip-and-replace",
  buyer:
    "CFOs, controllers, and IT leaders running Oracle E-Business Suite who need AI to work inside the system they already have — not a parallel platform that becomes a second source of truth.",
  problem:
    "Oracle EBS wasn't built for AI agents. Custom APIs, legacy auth, and a security model that predates agentic AI mean most \"AI for ERP\" vendors stop at read-only dashboards.",
  outcome:
    "A governed AI agent running inside your Oracle EBS environment — reading real modules, executing through your application's own logic layer, with an audit trail your control owners can review.",
  proof: [
    {
      label: "Built by an EBS operator",
      detail:
        "Before founding Tioga AI, Sukir managed ERP, HR, CRM, and business-reporting systems — including Oracle EBS — across four sister companies. That's operator-level fluency with how EBS actually gets used, not textbook API knowledge.",
    },
    {
      label: "Live migration-readiness demo",
      detail:
        "Try the Oracle EBS → S/4HANA Migration Assessment demo below — a real automated readiness scan running against sample data, not a mockup screenshot.",
    },
    {
      label: "Governed write-path, not just reads",
      detail:
        "The Agent-Ready ERP Diagnostic & Governed Write-Path engagement builds toward real write access — through EBS's own application logic layer, with policy enforcement, not a database bypass.",
    },
    {
      label: "No rip-and-replace",
      detail:
        "Every engagement extends your existing Oracle investment. Nothing here asks you to migrate off EBS to get AI capability.",
    },
  ],
  offers: [
    {
      name: "Agent-Ready ERP Diagnostic & Governed Write-Path",
      price: "$60–120K",
      duration: "~6 weeks",
      desc: "Assess one stalled agent-to-ERP write path, then build a governed version of it — executing through EBS's own logic layer, with policy enforcement and an audit-grade evidence trail your control owners can actually clear.",
    },
    {
      name: "Legacy System AI Augmentation",
      price: "$40–100K",
      duration: "8–16 weeks",
      desc: "Add AI capability to your existing Oracle EBS environment without replacing the underlying system — extending what works rather than ripping it out.",
    },
    {
      name: "ERP Modernization Advisory",
      price: "$15–25K/month",
      duration: "3–12 months",
      desc: "Ongoing strategic guidance for organizations modernizing Oracle EBS — with AI integration as a first-class requirement, including migration planning if that's part of your roadmap.",
    },
  ],
  faq: [
    {
      q: "Does this replace our Oracle EBS instance?",
      a: "No. Every engagement builds AI capability on top of or alongside EBS — nothing here proposes migrating off it unless that's explicitly your goal.",
    },
    {
      q: "Can an AI agent actually write to EBS safely?",
      a: "Yes, through the same application logic layer and approval workflows your human users go through — not direct database writes. The Governed Write-Path engagement is built specifically around this.",
    },
    {
      q: "What if we're mid-migration to S/4HANA already?",
      a: "See the dedicated EBS → S/4HANA migration solution — it's built for exactly that transition window.",
    },
    {
      q: "Do you need access to our production Oracle instance to start?",
      a: "No. The 5-day Discovery Sprint runs against sample data and your documented workflows first — production access, if needed, comes later and stays under your control.",
    },
  ],
  related: [
    { href: "/solutions/ebs-to-s4hana", label: "Migrating off EBS instead?" },
    { href: "/solutions/governed-write-path", label: "Governed write-path deep dive" },
    { href: "/services", label: "See all engagements" },
  ],
  demoLink: { href: "/demos/migration-assessment", label: "Try the EBS migration demo" },
};

export default function OracleSolutionPage() {
  return <SolutionPage content={content} />;
}
