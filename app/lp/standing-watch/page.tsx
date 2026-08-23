import type { Metadata } from "next";
import TrackedCTA from "@/components/TrackedCTA";
import ScrollReveal from "@/components/ScrollReveal";

// Campaign landing page for Standing Watch -- deliberately separate from
// /solutions/standing-watch (the full site page: FAQ, all three pricing
// tiers, related-links). This is the narrower one-pager for ad/outbound
// traffic: problem -> proof -> mechanism -> single CTA (the Assessment,
// the lowest-commitment entry point). noindex so it doesn't compete with
// the full solutions page for the same search terms.
export const metadata: Metadata = {
  title: "Standing Watch — Cross-System AI Agent Governance",
  description:
    "SAP, Workday, Databricks, and ServiceNow each ship their own AI agent governance pane, anchored to their own estate. Standing Watch is the discipline that governs across them.",
  robots: { index: false, follow: true },
};

const disciplines = [
  { n: "01", name: "Qualify", desc: "Capability floors enforced at routing time." },
  { n: "02", name: "Arbitrate", desc: "Compare spend across non-fungible budgets on one basis." },
  { n: "03", name: "Gate", desc: "Tiered autonomy with a structurally unreachable top tier." },
  { n: "04", name: "Probe", desc: "The same behavioral check run identically across every system in scope." },
  { n: "05", name: "Track", desc: "An aging findings ledger — nothing clears silently." },
  { n: "06", name: "Review", desc: "Fixed-cadence, criteria-based vendor/model reappraisal." },
];

const proof = [
  {
    label: "Built on Tioga's own infrastructure",
    detail:
      "Generalized from the JARVIS router, router-watch, and security-watch — running across a free local model, multiple OpenRouter-hosted vendors, direct-billed Gemini, and a subscription Claude that's never auto-routed. Single-operator scale, volunteered here, not extracted in a pitch.",
  },
  {
    label: "Propose-and-approve, never auto-applied",
    detail:
      "No automation ever writes to live configuration. Every finding becomes a dated proposal a human applies by hand — a durable, framework-mapped record of agent actions plus human approvals.",
  },
  {
    label: "See the real ledger, not a mockup",
    detail:
      "The Governance Ledger demo is a dated, real excerpt from Tioga's own AI routing gateway, mapped to the NIST AI RMF — the same infrastructure Track and Review are generalized from.",
  },
];

export default function StandingWatchLandingPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      {/* Hero / Problem */}
      <section className="pt-36 pb-20 px-6 max-w-4xl mx-auto">
        <ScrollReveal>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
          >
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            Standing Watch
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight text-balance">
            Every platform ships its own governance pane.{" "}
            <span style={{ color: "var(--accent)" }}>None of them govern the aggregate.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
            SAP, Workday, Databricks, and ServiceNow each anchor their AI agent governance to their own estate.
            Run three or four of these platforms and you own three or four single panes of glass — and still
            have no neutral layer that governs across them, which is exactly where the EU AI Act&apos;s deployer
            obligations and NIST/ISO program requirements actually attach.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          <ScrollReveal>
            <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-3xl font-bold" style={{ color: "var(--accent)" }}>13%</p>
              <p className="text-sm text-slate-300 mt-1">of enterprises believe their agent governance is adequate</p>
              <p className="text-xs text-slate-500 mt-2">Gartner, cited in SAP&apos;s Aug 2026 agent-sprawl analysis</p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-3xl font-bold" style={{ color: "var(--accent)" }}>94% / 12%</p>
              <p className="text-sm text-slate-300 mt-1">of IT leaders report agent-sprawl concern; only 12% run centralized governance</p>
              <p className="text-xs text-slate-500 mt-2">OutSystems, 1,900 IT leaders surveyed</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Proof */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-white mb-2">This isn&apos;t a framework on paper</h2>
          <p className="text-slate-400 mb-6 max-w-2xl">
            Six disciplines generalized from automations Tioga actually operates in production — across a
            genuinely heterogeneous, multi-vendor stack.
          </p>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-4">
          {proof.map((p) => (
            <ScrollReveal key={p.label}>
              <div className="p-5 rounded-xl h-full" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="text-sm font-semibold text-white mb-1.5">{p.label}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{p.detail}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Mechanism */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-white mb-2">Six disciplines, one running mechanism each</h2>
          <p className="text-slate-400 mb-6 max-w-2xl">
            Not a checklist — each discipline maps to something that actually runs on a schedule.
          </p>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
          {disciplines.map((d) => (
            <ScrollReveal key={d.n}>
              <div className="pl-4" style={{ borderLeft: "2px solid var(--accent)" }}>
                <p className="text-xs uppercase tracking-wide text-slate-500">{d.n} — {d.name}</p>
                <p className="text-sm text-slate-300 mt-1">{d.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-28 max-w-2xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-white mb-3">Start with the Assessment</h2>
          <p className="text-slate-400 mb-8">
            A fixed-fee diagnostic that seeds a real findings ledger you keep — regardless of what you decide next.
          </p>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-8 rounded-2xl text-left" style={{ background: "var(--bg-card)", border: "1px solid var(--accent)" }}>
            <p className="text-xs uppercase tracking-wide text-slate-500 text-center">Standing Watch Assessment</p>
            <p className="text-4xl font-bold text-center my-2" style={{ color: "var(--accent)" }}>$15–35K</p>
            <p className="text-sm text-slate-500 text-center mb-6">3–4 weeks</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-8">
              Agent inventory across your estate — consuming your existing SAP Agent Hub, Workday ASOR, Control
              Tower, or Unity AI Gateway data as sources. Delivers a qualification register and autonomy-tier
              map, a cross-vendor spend arbitration baseline, a first behavioral probe run across two or more
              systems, and a seeded findings ledger you keep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <TrackedCTA
                href="/contact"
                event="cta_book_call"
                data={{ location: "lp_standing_watch" }}
                className="px-8 py-3.5 rounded-xl text-white font-semibold text-center transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
              >
                Book a walkthrough
              </TrackedCTA>
              <TrackedCTA
                href="/demos/standing-watch"
                event="cta_view_demo"
                data={{ location: "lp_standing_watch" }}
                className="px-8 py-3.5 rounded-xl font-semibold text-center transition-all hover:border-slate-500 hover:text-white"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                See the real ledger
              </TrackedCTA>
            </div>
          </div>
        </ScrollReveal>
        <p className="text-xs text-slate-500 mt-6">
          Full disciplines, pricing tiers (Build, Retainer), and FAQ at{" "}
          <a href="/solutions/standing-watch" className="underline" style={{ color: "var(--text-muted-2)" }}>
            tioga.ai/solutions/standing-watch
          </a>
        </p>
      </section>
    </main>
  );
}
