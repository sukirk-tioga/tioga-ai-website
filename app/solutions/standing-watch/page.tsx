import type { Metadata } from "next";
import SolutionPage, { SolutionContent } from "@/components/SolutionPage";
import StandingWatchEstateDiagram from "@/components/StandingWatchEstateDiagram";

export const metadata: Metadata = {
  title: "Standing Watch — Independent AI Agent Verification & Evidence",
  description:
    "SAP, Workday, Databricks, and ServiceNow each ship their own AI agent governance pane, anchored to their own estate. Standing Watch is the independent layer that verifies agent behavior and composes one evidence record across them, on top of whatever control plane you already run — built and run on Tioga's own multi-vendor infrastructure.",
  alternates: { canonical: "/solutions/standing-watch" },
  openGraph: {
    title: "Standing Watch — Tioga AI",
    description: "Independent verification and evidence composition across your AI platforms, run as a permanent watch — not a fifth pane of glass.",
  },
};

const content: SolutionContent = {
  slug: "standing-watch",
  eyebrow: "Standing Watch",
  title: "Every platform ships its own governance pane. Standing Watch is the independent layer that verifies behavior and composes one evidence record across them.",
  buyer:
    "CIOs, CAIOs, and compliance leaders running AI agents across more than one enterprise platform — SAP, Workday, Databricks, ServiceNow, or a custom MCP estate — who need one verifiable, auditor-legible evidence story across them, not four competing single panes of glass.",
  problem:
    "Every major platform vendor now ships its own AI agent governance tool and calls it the layer of record — and each is structurally anchored to its own estate. Only 13% of organizations believe they have the right governance in place to manage AI agents (a Gartner estimate, cited in SAP's August 3, 2026 agent-sprawl article), and 94% of organizations surveyed are concerned about AI sprawl while only 12% have a centralized platform to manage it (OutSystems research, April 2026, nearly 1,900 global IT leaders). Run three or four of these platforms and you own three or four \"single panes of glass\" — and still have no independent layer that verifies agent behavior and composes one evidence record across them, which is where the EU AI Act's deployer obligations and NIST/ISO program requirements actually attach.",
  outcome:
    "An independent verification and evidence layer that sits on top of your existing platform tools and control plane rather than replacing them: an agent qualification register, a cross-vendor spend arbitration baseline, a tiered autonomy policy with a hard human ceiling, behavioral control verification run identically across every system in scope, and a findings ledger that ages instead of silently disappearing.",
  proof: [
    {
      label: "Built and run on Tioga's own multi-vendor infrastructure",
      detail:
        "The six disciplines below are generalized from automations Tioga actually operates in production — the JARVIS router, router-watch, and security-watch — across a genuinely heterogeneous stack (a free local model, multiple OpenRouter-hosted vendors, direct-billed Gemini, and a subscription Claude that's never auto-routed). This is a single-operator, personal-infrastructure-scale implementation, not an enterprise deployment — volunteered here, not extracted in a pitch.",
    },
    {
      label: "Propose-and-approve by default",
      detail:
        "Findings are proposals, not changes: nothing is applied on a finding's own authority. A small, hard-coded set of bounded change types (pure additions, syntax-checked afterward) may be applied automatically; everything else becomes a dated proposal a human reviews and applies — a durable, framework-mapped record of agent actions plus human approvals, composed independently of any single platform vendor.",
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
      desc: "Reconciles the agent inventory you already have — from your control plane, platform exports, or a manual list; Tioga does not compete with discovery tooling — and adds what those tools don't: a qualification register and autonomy-tier map, a cross-vendor spend arbitration baseline, a first behavioral probe run across two or more systems, and a seeded findings ledger you keep.",
    },
    {
      name: "Standing Watch Build",
      price: "$60–150K",
      duration: "8–16 weeks, scoped to estate breadth",
      desc: "Implements the behavioral probe harness and the propose-and-approve review workflow in your environment, on your credentials and repositories, on top of whatever control plane or gateway you already own — modeled on router-watch and security-watch. Tioga does not build a gateway, policy engine, or discovery product, and will not be a required runtime dependency.",
    },
    {
      name: "Standing Watch Retainer",
      price: "$5–15K/month",
      duration: "Ongoing",
      desc: "Router-watch and security-watch as a service, generalized to your estate: a weekly automated watch run (probes, spend arbitration, vendor/model currency review), a monthly human review of the findings ledger, and quarterly evidence packs mapped to NIST AI RMF, ISO 42001, and the EU AI Act.",
    },
  ],
  whyNotPlatform: {
    heading: "Works alongside your control plane",
    paragraphs: [
      "If you already run an AI gateway or agent-security control plane — for discovery, identity, policy enforcement, or a kill switch — keep it. Standing Watch does not build or replace one, and it does not compete on discovery breadth or runtime enforcement: a continuously running product will beat a manual pass on both.",
      "What it adds is the part a single product's pane is least placed to say about itself: independent, fixed-cadence behavioral verification run identically across every system in scope, spend compared on one basis across non-fungible budgets, and one findings ledger and evidence pack mapped to NIST AI RMF, ISO 42001, and the EU AI Act that a named human owner reviews.",
      "Scoping starts with one question: which gateway, control plane, or platform governance tool do you run today? The Assessment uses whatever inventory or log export that tool can produce — a CSV or a report is enough — and says plainly where a control-plane product is the right next purchase.",
    ],
  },
  faq: [
    {
      q: "Does Standing Watch replace our SAP, Workday, or Databricks governance tools?",
      a: "No. Standing Watch uses those tools' discovery, risk-rating, and observability data as inputs where you can export them, and adds what a single-platform tool isn't positioned to do across vendor boundaries: policy translation to NIST/ISO/EU AI Act, cross-vendor spend arbitration, and behavioral verification that doesn't stop at a closed platform's edge.",
    },
    {
      q: "Is this actually running somewhere, or is it a framework on paper?",
      a: "It's running code Tioga operates on its own infrastructure today, and I'll show it in a demo: the router registry, a dated router-watch proposal report, and the security-watch findings ledger. It's honestly personal-scale — a two-machine, five-backend estate, not a Fortune 500 deployment — and I say so before you have to ask.",
    },
    {
      q: "How is this different from a governance platform we could just buy?",
      a: "A platform gives you a pane — often a good one, and you may well buy one. It records what its own estate reports about itself. Discovering an agent inside a closed platform doesn't by itself establish that its actions were authorized, valid under that platform's own logic, and consistent with your controls, and a platform vendor can't neutrally referee spend or workload decisions between itself and its competitors. Standing Watch is the independent, fixed-cadence verification and evidence layer that sits on top of any platform you already own.",
    },
    {
      q: "How does the engagement actually progress?",
      a: "Assessment first — a fixed-fee diagnostic that seeds a real findings ledger you keep regardless of what you decide next. If it's a fit, Build implements the probe harness and review workflow in your environment, on top of the control plane you already use. The Retainer then runs it weekly, going forward, as your team's own control owners review and approve every change.",
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
