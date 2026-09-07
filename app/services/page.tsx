import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Three practices, sixteen priced engagements — systems-led AI automation, ERP agent layers, and AI governance built for Oracle, SAP, and Salesforce environments.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services — Tioga AI",
    description:
      "Three practices, sixteen priced engagements — systems-led AI automation, ERP agent layers, and AI governance for Oracle, SAP, and Salesforce.",
  },
};

interface Offer {
  name: string;
  desc: string;
  price: string;
  duration: string;
  href?: string;
  ctaLabel?: string;
}

interface Practice {
  key: string;
  name: string;
  blurb: string;
  offers: Offer[];
}

const PRACTICES: Practice[] = [
  {
    key: "automate",
    name: "Automate finance and operations",
    blurb:
      "Find the highest-ROI manual work in finance, HR, procurement, and operations, then build a production agent against it.",
    offers: [
      {
        name: "AI Operations Assessment",
        desc: "Map manual workflows across finance, HR, procurement, and operations. Rank automation opportunities by ROI and feasibility. Concrete plan in your hands.",
        price: "$10–15K",
        duration: "2–3 weeks",
      },
      {
        name: "AI Agent Pilot",
        desc: "Production-ready AI agent built against your highest-value workflow, integrated with your real systems, with governance documentation delivered alongside the code.",
        price: "$25–50K",
        duration: "4–8 weeks",
      },
    ],
  },
  {
    key: "erp",
    name: "Modernize ERP with an agent layer",
    blurb:
      "Add AI capability to Oracle EBS, SAP, or a legacy ERP without ripping out what already works — including the one stalled agent-to-ERP write path that's actually blocking you.",
    offers: [
      {
        name: "Agent-Ready ERP Diagnostic & Governed Write-Path",
        desc: "Assess one stalled agent-to-ERP write path, then build a governed version of it — executing through your application's own logic layer, with policy enforcement and an audit-grade evidence trail your control owners can actually clear.",
        price: "$60–120K",
        duration: "~6 weeks",
      },
      {
        name: "Salesforce Governed Write-Path & Evidence Build",
        desc: "Closes the gap Salesforce's own architects admit exists — hosted MCP servers on Salesforce are GA and free on Enterprise Edition+ with full user attribution, but the governance layer above that (a value/velocity policy an agent's permission set can't express, a server-side approval gate independent of which AI client is calling, a decision ledger recording policy version, approver, and reason for every evaluated write) is yours to build. Tioga builds that layer for one high-value Salesforce write path.",
        price: "$50–100K",
        duration: "5–8 weeks",
      },
      {
        name: "Legacy System AI Augmentation",
        desc: "Add AI capability to your existing ERP, CRM, or HRIS without replacing the underlying system — extending what works rather than ripping it out.",
        price: "$40–100K",
        duration: "8–16 weeks",
      },
      {
        name: "ERP Modernization Advisory",
        desc: "Ongoing strategic guidance for organizations modernizing Oracle EBS, SAP legacy, or custom ERP environments — with AI integration as a first-class requirement.",
        price: "$15–25K/month",
        duration: "3–12 months",
      },
    ],
  },
  {
    key: "govern",
    name: "Govern enterprise AI",
    blurb:
      "NIST AI RMF, ISO 42001, EU AI Act, and US state-law programs — plus fractional leadership — for organizations that need AI risk management built into the architecture, not backfilled after a pilot succeeds. This is the deepest bench of the three practices: ten engagements, from a one-time gap analysis to ongoing governance leadership.",
    offers: [
      {
        name: "AI Governance Readiness Assessment",
        desc: "NIST AI RMF, ISO 42001, EU AI Act, and US state law gap analysis with a prioritized remediation roadmap and sample executive summary.",
        price: "$20–35K",
        duration: "3–4 weeks",
      },
      {
        name: "AI Cost & Model Governance Assessment",
        desc: "Model-tiering policy, token/cache optimization, budget guardrails, and model-governance rules — built on the same routing infrastructure behind Tioga's own live Governance Ledger demo.",
        price: "$10–20K",
        duration: "2–3 weeks",
      },
      // "AI Governance Evidence Package for Insurance Underwriting" removed
      // 2026-09-01: its demand thesis failed independent 3-vote adversarial
      // verification (refuted 0-3) and is marked "do not send" in
      // sales/offer-data-reference.md. Was live on this page despite that
      // internal flag -- see the 2026-09-01 four-axis review.
      {
        name: "Agentic AI Governance Framework",
        desc: "Governance architecture for organizations deploying autonomous AI agents in production — risk registers, oversight controls, and escalation protocols.",
        price: "$30–75K",
        duration: "4–8 weeks",
      },
      {
        name: "Multi-State AI Compliance Program",
        desc: "Gap analysis and remediation roadmap across US state AI laws for organizations operating in multiple jurisdictions.",
        price: "$40–80K",
        duration: "6–10 weeks",
      },
      {
        name: "ISO 42001 Implementation Sprint",
        desc: "Structured implementation of an AI management system aligned to ISO 42001, from readiness assessment to certification-ready documentation.",
        price: "$50–120K",
        duration: "3–6 months",
      },
      {
        name: "EU AI Act Conformity Program",
        desc: "Full conformity documentation, technical files, and governance controls for organizations subject to the EU AI Act, structured for audit readiness.",
        price: "$75–200K",
        duration: "4–8 months",
      },
      {
        name: "Fractional AI Governance Officer",
        desc: "Ongoing governance leadership for organizations that need AI risk management expertise without a full-time hire — structured as a monthly retainer.",
        price: "$12–25K/month",
        duration: "6–12 months",
      },
      {
        name: "Standing Watch Assessment",
        desc: "Agent inventory across your estate — consuming your existing SAP Agent Hub, Workday ASOR, Control Tower, or Unity AI Gateway data as sources, not sunk mistakes. Delivers a qualification register, a cross-vendor spend arbitration baseline, a first behavioral probe run, and a seeded findings ledger you keep regardless of what you decide next.",
        price: "$15–35K",
        duration: "3–4 weeks",
        href: "/solutions/standing-watch",
        ctaLabel: "See the full Standing Watch ladder →",
      },
      {
        name: "Standing Watch Build",
        desc: "Implements the propose-and-approve gating layer and the behavioral probe harness in your environment, on your credentials and repositories — modeled directly on router-watch and security-watch's architecture. Tioga will not be a required runtime dependency.",
        price: "$60–150K",
        duration: "8–16 weeks, scoped to estate breadth",
        href: "/solutions/standing-watch",
        ctaLabel: "See the full Standing Watch ladder →",
      },
      {
        name: "Standing Watch Retainer",
        desc: "Router-watch and security-watch as a service, generalized to your estate: a weekly automated watch run, a monthly human review of the findings ledger, and quarterly evidence packs mapped to NIST AI RMF, ISO 42001, and the EU AI Act.",
        price: "$5–15K/month",
        duration: "Ongoing",
        href: "/solutions/standing-watch",
        ctaLabel: "See the full Standing Watch ladder →",
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6" style={{ color: "var(--text)" }}>Services</h1>
        <p className="text-[var(--text-muted)] text-lg max-w-2xl leading-relaxed mb-4">
          Tioga AI runs three practices — automating finance and operations, modernizing ERP with an agent layer, and governing enterprise AI. Sixteen engagements sit underneath them, each scoped to deliver a concrete, reviewable output — not a slide deck — with pricing and timelines defined up front.
        </p>
        <p className="text-[var(--text-muted)] text-sm max-w-2xl leading-relaxed mb-16">
          Every engagement below starts with a 5-day{" "}
          <Link href="/discovery-sprint" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors">
            Discovery Sprint
          </Link>{" "}
          ($5,000 flat, prototype included) that scopes the work before any larger commitment. If you move forward, the $5,000 is credited toward the price of the engagement below. Not sure yet whether you have a real, provisionable use case? Start with the{" "}
          <Link href="/ai-fit-check" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors">
            AI Fit Check
          </Link>{" "}
          instead — one day, $1,500, fully remote, credited in full toward the Sprint if you proceed.
        </p>

        <div className="space-y-16">
          {PRACTICES.map((practice, pi) => (
            <div key={practice.key}>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-sm font-mono" style={{ color: "var(--accent)" }}>
                  {String(pi + 1).padStart(2, "0")}
                </span>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{practice.name}</h2>
              </div>
              <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed mb-6">{practice.blurb}</p>
              <div className="space-y-4">
                {practice.offers.map((offer) => (
                  <div
                    key={offer.name}
                    className="p-7 rounded-2xl"
                    style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>{offer.name}</h3>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{offer.desc}</p>
                      </div>
                      <div className="shrink-0 text-right md:pl-8">
                        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{offer.price}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{offer.duration}</p>
                      </div>
                    </div>
                    <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                      <Link
                        href={offer.href ?? "/contact"}
                        className="text-sm font-medium transition-colors hover:text-[var(--text)]"
                        style={{ color: "var(--accent)" }}
                      >
                        {offer.ctaLabel ?? "Start a conversation about this engagement →"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-7 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Sample artifacts</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5 max-w-2xl">
            Four sanitized samples of what an engagement actually produces — illustrative data, real format.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: "/samples/discovery-sprint-scope.html", label: "Discovery sprint scope" },
              { href: "/samples/governance-evidence-excerpt.html", label: "Governance evidence excerpt" },
              { href: "/samples/ai-governance-executive-summary.html", label: "Governance readiness — exec summary" },
              { href: "/samples/weekly-value-report.html", label: "Weekly value report (ongoing engagements)" },
            ].map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-4 py-3 rounded-xl transition-colors hover:text-[var(--text)]"
                style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--accent)" }}
              >
                {s.label} →
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/contact"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Start a conversation
          </Link>
          <p className="text-xs text-[var(--text-muted)] mt-4">
            Not sure where to start?{" "}
            <Link href="/#services" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors">
              See the three entry-point offers →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
