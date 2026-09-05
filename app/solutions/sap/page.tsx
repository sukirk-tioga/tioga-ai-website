import type { Metadata } from "next";
import SolutionPage, { SolutionContent } from "@/components/SolutionPage";

export const metadata: Metadata = {
  title: "AI Agents for SAP",
  description:
    "Governed AI agents for SAP — real module integration, audit-ready controls, and no generic RPA that breaks when the UI changes.",
  alternates: { canonical: "/solutions/sap" },
  openGraph: {
    title: "AI Agents for SAP — Tioga AI",
    description: "Governed AI agents that work inside your existing SAP environment.",
  },
};

const content: SolutionContent = {
  slug: "sap",
  eyebrow: "SAP",
  title: "AI agents for SAP — governed, not generic",
  buyer:
    "CIOs, finance-transformation leaders, and ERP owners running SAP who need AI automation that respects existing controls, not a bolt-on chatbot.",
  problem:
    "Most \"AI for SAP\" tools are read-only reporting layers or generic RPA scripts that break the moment SAP's UI changes. Neither gets you a governed agent that can actually act.",
  outcome:
    "A production AI agent scoped to your highest-value SAP workflow, integrated with real modules, with governance documentation delivered alongside the code — not after.",
  proof: [
    {
      label: "Built by an SAP operator",
      detail:
        "Before founding Tioga AI, the founder managed ERP, HR, CRM, and business-reporting systems — including SAP — across four sister companies. That's operator-level fluency, not textbook API knowledge.",
    },
    {
      label: "Governance built in, not bolted on",
      detail:
        "NIST AI RMF, ISO 42001, and EU AI Act alignment are part of the architecture from day one — see the live Governance Ledger demo for the real pattern this is built on.",
    },
    {
      label: "No rip-and-replace",
      detail:
        "Every engagement extends your existing SAP investment, whether you're on ECC or S/4HANA — nothing here requires migrating to get AI capability.",
    },
    {
      label: "Real systems, not sandboxes",
      detail:
        "Every demo on this site runs against real (synthetic, clearly labeled) data through a genuine multi-turn agentic loop — not a scripted click-through.",
    },
  ],
  offers: [
    {
      name: "Agent-Ready ERP Diagnostic & Governed Write-Path",
      price: "$60–120K",
      duration: "~6 weeks",
      desc: "Assess one stalled agent-to-ERP write path, then build a governed version of it — executing through SAP's own logic layer, with policy enforcement and an audit-grade evidence trail your control owners can actually clear.",
    },
    {
      name: "Legacy System AI Augmentation",
      price: "$40–100K",
      duration: "8–16 weeks",
      desc: "Add AI capability to your existing SAP environment without replacing the underlying system — extending what works rather than ripping it out.",
    },
    {
      name: "ERP Modernization Advisory",
      price: "$15–25K/month",
      duration: "3–12 months",
      desc: "Ongoing strategic guidance for organizations modernizing SAP legacy environments — with AI integration as a first-class requirement.",
    },
  ],
  faq: [
    {
      q: "Do you work with SAP ECC or only S/4HANA?",
      a: "Both — the governance and integration approach is the same regardless of which SAP generation you're on; scope is set during the Discovery Sprint based on your specific environment.",
    },
    {
      q: "Will this touch our production SAP instance directly?",
      a: "Not without your explicit sign-off. Engagements typically start against sample data and documented workflows before any production integration.",
    },
    {
      q: "How is this different from generic RPA on SAP?",
      a: "RPA scripts click through the UI and break when it changes. Tioga's agents integrate through SAP's application/API layer with policy enforcement and an audit trail — built to survive UI changes and pass a control review.",
    },
    {
      q: "What does \"governed\" actually mean here?",
      a: "Every agent action is scoped, logged, and mapped to NIST AI RMF / ISO 42001 controls from day one — not documentation written after the fact.",
    },
  ],
  related: [
    { href: "/solutions/ap-automation", label: "AP automation for SAP" },
    { href: "/solutions/governed-write-path", label: "Governed write-path deep dive" },
    { href: "/services", label: "See all engagements" },
  ],
  demoLink: { href: "/demos/ap-exception-workflow", label: "See an AP agent run" },
};

export default function SapSolutionPage() {
  return <SolutionPage content={content} />;
}
