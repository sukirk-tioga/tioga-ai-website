import type { Metadata } from "next";
import SolutionPage, { SolutionContent } from "@/components/SolutionPage";

export const metadata: Metadata = {
  title: "Enterprise AI Governance",
  description:
    "NIST AI RMF, ISO 42001, EU AI Act, and US state-law AI governance programs — built into the architecture, not backfilled after a pilot succeeds.",
  alternates: { canonical: "/solutions/ai-governance" },
  openGraph: {
    title: "Enterprise AI Governance — Tioga AI",
    description: "AI governance programs built into the architecture from day one.",
  },
};

const content: SolutionContent = {
  slug: "ai-governance",
  eyebrow: "AI Governance",
  title: "AI governance that's built into the architecture, not backfilled after a pilot succeeds",
  buyer:
    "CCOs, CAIOs, and compliance leaders who need a real AI governance program — NIST AI RMF, ISO 42001, EU AI Act, or US state law — not a policy document that doesn't match what's actually running in production.",
  problem:
    "Most AI governance work happens after a pilot already succeeded and someone in legal asks whether it's compliant. By then the architecture doesn't have oversight controls, evidence logging, or human-review gates built in — those get bolted on, badly.",
  outcome:
    "A governance program — gap analysis and a remediation roadmap, and, if you're building with Tioga, an architecture with oversight, evidence, and an audit trail built in from the first line of code.",
  proof: [
    {
      label: "The deepest bench of the three practices",
      detail:
        "Eight distinct governance engagements exist because this is the actual center of Tioga's business — not a checkbox practice bolted onto an automation shop.",
    },
    {
      label: "Built on the same infrastructure Tioga runs itself",
      detail:
        "The live Governance Ledger demo uses real routing data from Tioga's own AI operations, mapped to NIST AI RMF — not a hypothetical example.",
    },
    {
      label: "Framework-mapped, not framework-namedropped",
      detail:
        "See the NIST / ISO 42001 / EU AI Act framework-mapping page — a real conceptual alignment across all three, not three logos next to each other.",
    },
    {
      label: "Operator experience with audit-readiness",
      detail:
        "Before founding Tioga AI, Sukir managed the governance work that keeps ERP, HR, and CRM systems audit-ready across four sister companies — not just AI-specific compliance theory.",
    },
  ],
  offers: [
    {
      name: "AI Governance Readiness Assessment",
      price: "$20–35K",
      duration: "3–4 weeks",
      desc: "NIST AI RMF, ISO 42001, EU AI Act, and US state law gap analysis with a prioritized remediation roadmap and sample executive summary.",
    },
    {
      name: "Agentic AI Governance Framework",
      price: "$30–75K",
      duration: "4–8 weeks",
      desc: "Governance architecture for organizations deploying autonomous AI agents in production — risk registers, oversight controls, and escalation protocols.",
    },
    {
      name: "ISO 42001 Implementation Sprint",
      price: "$50–120K",
      duration: "3–6 months",
      desc: "Structured implementation of an AI management system aligned to ISO 42001, from readiness assessment to certification-ready documentation.",
    },
    {
      name: "EU AI Act Conformity Program",
      price: "$75–200K",
      duration: "4–8 months",
      desc: "Full conformity documentation, technical files, and governance controls for organizations subject to the EU AI Act, structured for audit readiness.",
    },
  ],
  faq: [
    {
      q: "Which framework should we align to — NIST, ISO 42001, or the EU AI Act?",
      a: "Depends on your regulatory exposure and buyer requirements — the Readiness Assessment includes a framework-fit recommendation, not just a generic checklist against all three.",
    },
    {
      q: "Do we need to be ISO 42001 certified?",
      a: "Not necessarily — certification is one path. The framework-mapping page shows how NIST, ISO 42001, and the EU AI Act line up conceptually, so you can see what applies before committing to certification specifically.",
    },
    {
      q: "Is this governance-as-consulting, or does it touch our actual AI systems?",
      a: "Both, depending on the engagement — some, like the Readiness Assessment, are gap-analysis and roadmap; others, like the Agentic AI Governance Framework, build oversight controls into a system you're actually running.",
    },
    {
      q: "What if we're pre-pilot and don't have anything running yet?",
      a: "That's the ideal time to start — governance built into the architecture from day one is materially cheaper than retrofitting it after a pilot succeeds.",
    },
  ],
  related: [
    { href: "/trust", label: "See the Trust Center" },
    { href: "/trust/framework-mapping", label: "NIST / ISO 42001 / EU AI Act mapping" },
    { href: "/articles/framework-mapping-not-three-checklists", label: "Read: one mapping, not three checklists" },
    { href: "/services", label: "See all 8 governance engagements" },
  ],
  demoLink: { href: "/demos/governance-ledger", label: "See the Governance Ledger demo" },
};

export default function AiGovernanceSolutionPage() {
  return <SolutionPage content={content} />;
}
