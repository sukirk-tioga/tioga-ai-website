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
        "Ten distinct governance engagements exist because this is the actual center of Tioga's business — not a checkbox practice bolted onto an automation shop.",
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
        "Before founding Tioga AI, the founder managed the governance work that keeps ERP, HR, and CRM systems audit-ready across four sister companies — not just AI-specific compliance theory.",
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
      name: "AI Cost & Model Governance Assessment",
      price: "$10–20K",
      duration: "2–3 weeks",
      desc: "Model-tiering policy, token/cache optimization, budget guardrails, and model-governance rules — built on the same routing infrastructure behind Tioga's own live Governance Ledger demo.",
    },
    {
      name: "Agentic AI Governance Framework",
      price: "$30–75K",
      duration: "4–8 weeks",
      desc: "Governance architecture for organizations deploying autonomous AI agents in production — risk registers, oversight controls, and escalation protocols.",
    },
    {
      name: "Multi-State AI Compliance Program",
      price: "$40–80K",
      duration: "6–10 weeks",
      desc: "Gap analysis and remediation roadmap across US state AI laws for organizations operating in multiple jurisdictions.",
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
    {
      name: "Fractional AI Governance Officer",
      price: "$12–25K/month",
      duration: "6–12 months",
      desc: "Ongoing governance leadership for organizations that need AI risk management expertise without a full-time hire — structured as a monthly retainer.",
    },
    {
      name: "Standing Watch Assessment",
      price: "$15–35K",
      duration: "3–4 weeks",
      desc: "Agent inventory across your estate — consuming your existing SAP Agent Hub, Workday ASOR, Control Tower, or Unity AI Gateway data as sources, not sunk mistakes. Delivers a qualification register and autonomy-tier map, a cross-vendor spend arbitration baseline, a first behavioral probe run across two or more systems, and a seeded findings ledger you keep. See the full Standing Watch ladder at /solutions/standing-watch.",
    },
    {
      name: "Standing Watch Build",
      price: "$60–150K",
      duration: "8–16 weeks, scoped to estate breadth",
      desc: "Implements the propose-and-approve gating layer and the behavioral probe harness in your environment, on your credentials and repositories — modeled directly on router-watch and security-watch's architecture. Tioga will not be a required runtime dependency.",
    },
    {
      name: "Standing Watch Retainer",
      price: "$5–15K/month",
      duration: "Ongoing",
      desc: "Router-watch and security-watch as a service, generalized to your estate: a weekly automated watch run, a monthly human review of the findings ledger, and quarterly evidence packs mapped to NIST AI RMF, ISO 42001, and the EU AI Act.",
    },
  ],
  /* Sourced from: sales/proposals/09-agentic-ai-governance-framework.md
     "Why Tioga" section (ServiceNow Action Fabric / AI Control Tower
     paragraph, added 2026-08-17, citing [[palantir-servicenow-native-agents-2026-08-17]]
     and [[native-agent-landscape-all-systems-2026-08-17]] §4 item 2); SAP
     Agent Hub / Joule and Salesforce hosted-MCP facts from
     research/tioga-comprehensive-business-readiness-audit-2026-09-02.md G-36
     (verified live 2026-09-02). Vendor comparison named directly here per
     sales/differentiator-and-positioning.md's "What got cut from the first
     draft" convention: named comparisons are cut from reusable copy but
     allowed in a tailored section answering a prospect actively evaluating
     that platform — this page's whole purpose is answering that objection. */
  whyNotPlatform: {
    heading: "Why not just use what ServiceNow, SAP, or Salesforce already ship?",
    paragraphs: [
      "It's a fair question, and worth answering directly instead of deflecting. ServiceNow ships Action Fabric — a GA MCP server bundled into every Now Assist / AI Native SKU — that routes external agent actions through ServiceNow's own flows, playbooks, and approvals, and its AI Control Tower now ships pre-built EU AI Act, California AI Act, and Colorado AI Act compliance content, cross-mapped to NIST AI RMF. SAP ships its own Agent Hub, Joule Agent Studio, and an MCP gateway. Salesforce ships hosted MCP servers, GA and free on Enterprise Edition and above, with full user attribution. All three are real, shipped, and genuinely useful inside their own estate.",
      "The gap is structural, not a missing feature they'll ship next quarter: each of these tools governs the platform it ships with, not the agents running elsewhere in your stack. ServiceNow's own published materials put closed platforms like SAP on its discovery list — something it can see — not its observability list — something it actively governs. An SAP Agent Hub control has no visibility into a ServiceNow-routed action, and a Salesforce MCP attribution log doesn't reach an agent acting inside Oracle or Workday. Run two or more of these platforms — most mid-market and enterprise estates do — and you end up with two or three well-built, non-overlapping panes of glass, and still no single record of what any agent did, under what policy, with what human approval, across the aggregate.",
      "There's a second reason this isn't a build-it-yourself gap: a platform vendor can't neutrally referee a spend or workload decision between itself and a competitor's platform sitting in the same estate. If ServiceNow's agent economics compete for the same budget or workflow as a Salesforce or SAP agent, ServiceNow's own tooling has no incentive to surface that trade-off honestly — and the reverse is equally true. That's not an accusation of bad faith; it's a structural conflict of interest built into who's asking the question. Governance that spans platforms has to sit above all of them, held by a party with no stake in which platform wins the budget.",
      "That's the layer Tioga builds: an aggregation and verification layer that consumes what ServiceNow, SAP, and Salesforce already produce — their own discovery, risk-rating, and observability data — as inputs, and adds what none of them do on their own: policy translation across all three to one framework set (NIST AI RMF, ISO 42001, the EU AI Act), a cross-vendor spend and workload arbitration baseline, and a single composed record tying a specific agent's action to the specific policy version and the specific human approval behind it, regardless of which platform the agent ran on. If you already run one of these platforms, keep it — this doesn't replace it. It's what makes three separate platform-native governance panes add up to one governed estate instead of three.",
    ],
  },
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
    { href: "/services", label: "See all 10 governance engagements" },
  ],
  demoLink: { href: "/demos/governance-ledger", label: "See the Governance Ledger demo" },
};

export default function AiGovernanceSolutionPage() {
  return <SolutionPage content={content} />;
}
