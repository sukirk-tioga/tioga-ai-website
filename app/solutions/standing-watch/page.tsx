import type { Metadata } from "next";
import SolutionPage, { SolutionContent } from "@/components/SolutionPage";
import StandingWatchEstateDiagram from "@/components/StandingWatchEstateDiagram";

export const metadata: Metadata = {
  title: "Standing Watch — Cross-System AI Agent Governance",
  description:
    "SAP, Workday, Databricks, and ServiceNow each ship their own AI agent governance pane, anchored to their own estate. Standing Watch is the discipline that governs across them — built and run on Tioga's own multi-vendor infrastructure.",
  alternates: { canonical: "/solutions/standing-watch" },
  openGraph: {
    title: "Standing Watch — Tioga AI",
    description: "Cross-system AI agent governance, run as a permanent watch — not a fifth pane of glass.",
  },
};

const content: SolutionContent = {
  slug: "standing-watch",
  eyebrow: "Standing Watch",
  title: "Every platform ships its own governance pane. Standing Watch is the discipline that governs across them.",
  buyer:
    "CIOs, CAIOs, and compliance leaders running AI agents across more than one enterprise platform — SAP, Workday, Databricks, ServiceNow, or a custom MCP estate — who need an aggregate governance and compliance story, not four competing single panes of glass.",
  problem:
    "Every major platform vendor now ships its own AI agent governance tool and calls it the layer of record — and each is structurally anchored to its own estate. Only 13% of enterprises believe their agent governance is adequate (Gartner research, cited in SAP's own August 2026 agent-sprawl analysis), and 94% of IT leaders report agent-sprawl concern while only 12% run a centralized governance platform (OutSystems, 1,900 IT leaders surveyed). Run three or four of these platforms and you own three or four \"single panes of glass\" — and still have no neutral layer that governs the aggregate, which is exactly where the EU AI Act's deployer obligations and NIST/ISO program requirements actually attach.",
  outcome:
    "A governance layer that sits above and across your existing platform tools rather than replacing them: an agent qualification register, a cross-vendor spend arbitration baseline, a tiered autonomy policy with a hard human ceiling, behavioral control verification run identically across every system in scope, and a findings ledger that ages instead of silently disappearing.",
  proof: [
    {
      label: "Built and run on Tioga's own multi-vendor infrastructure",
      detail:
        "The six disciplines below are generalized from automations Tioga actually operates in production — the JARVIS router, router-watch, and security-watch — across a genuinely heterogeneous stack (a free local model, multiple OpenRouter-hosted vendors, direct-billed Gemini, and a subscription Claude that's never auto-routed). This is a single-operator, personal-infrastructure-scale implementation, not an enterprise deployment — volunteered here, not extracted in a pitch.",
    },
    {
      label: "Propose-and-approve, never auto-applied",
      detail:
        "No automation ever writes to live configuration. Every finding becomes a dated proposal a human applies by hand — the durable, framework-mapped record of agent actions plus human approvals that no vendor platform currently ships as a byproduct of operating.",
    },
    {
      label: "Six disciplines, one running mechanism each",
      detail:
        "Qualify (capability floors enforced at routing time), Arbitrate (compare spend across non-fungible budgets on one basis), Gate (tiered autonomy with a structurally unreachable top tier), Probe (the same behavioral check run identically across every system in scope), Track (an aging findings ledger — nothing clears silently), Review (fixed-cadence, criteria-based vendor/model reappraisal).",
    },
    {
      label: "See the real ledger, not a mockup",
      detail:
        "The Governance Ledger demo is a dated, real excerpt from Tioga's own AI routing gateway, mapped to the NIST AI RMF — the same infrastructure Standing Watch's Track and Review disciplines are generalized from.",
    },
  ],
  offers: [
    {
      name: "Standing Watch Assessment",
      price: "$15–35K",
      duration: "3–4 weeks",
      desc: "Agent inventory across your estate — consuming your existing SAP Agent Hub, Workday ASOR, Control Tower, or Unity AI Gateway data as sources, not sunk mistakes. Delivers a qualification register and autonomy-tier map, a cross-vendor spend arbitration baseline, a first behavioral probe run across two or more systems, and a seeded findings ledger you keep.",
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
      desc: "Router-watch and security-watch as a service, generalized to your estate: a weekly automated watch run (probes, spend arbitration, vendor/model currency review), a monthly human review of the findings ledger, and quarterly evidence packs mapped to NIST AI RMF, ISO 42001, and the EU AI Act.",
    },
  ],
  faq: [
    {
      q: "Does Standing Watch replace our SAP, Workday, or Databricks governance tools?",
      a: "No. Standing Watch consumes those tools' discovery, risk-rating, and observability data as inputs and adds what none of them do across vendor boundaries: policy translation to NIST/ISO/EU AI Act, cross-vendor spend arbitration, and behavioral verification that doesn't stop at a closed platform's edge.",
    },
    {
      q: "Is this actually running somewhere, or is it a framework on paper?",
      a: "It's running code Tioga operates on its own infrastructure today, and we'll show it in a demo: the router registry, a dated router-watch proposal report, and the security-watch findings ledger. It's honestly personal-scale — a two-machine, five-backend estate, not a Fortune 500 deployment — and we say so before you have to ask.",
    },
    {
      q: "How is this different from a governance platform we could just buy?",
      a: "A platform purchase gives you another pane of glass, however broad its claims. Discovering an agent inside a closed platform doesn't establish that its actions were authorized, valid under that platform's own logic, and consistent with your controls — and no platform vendor can neutrally referee spend or workload decisions between itself and its competitors. Standing Watch is the program and verification layer that sits above any platform you already own.",
    },
    {
      q: "How does the engagement actually progress?",
      a: "Assessment first — a fixed-fee diagnostic that seeds a real findings ledger you keep regardless of what you decide next. If it's a fit, Build implements the gating and probe infrastructure in your environment. The Retainer then runs it weekly, going forward, as your team's own control owners review and approve every change.",
    },
  ],
  related: [
    { href: "/trust", label: "See the Trust Center" },
    { href: "/trust/framework-mapping", label: "NIST / ISO 42001 / EU AI Act mapping" },
    { href: "/solutions/ai-governance", label: "See the AI Governance solution" },
    { href: "/services", label: "See all engagements" },
  ],
  demoLink: { href: "/demos/standing-watch", label: "See it in action" },
  visual: <StandingWatchEstateDiagram />,
};

export default function StandingWatchSolutionPage() {
  return <SolutionPage content={content} />;
}
