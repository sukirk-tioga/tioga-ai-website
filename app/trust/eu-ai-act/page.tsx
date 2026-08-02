import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EU AI Act Exposure",
  description:
    "What EU AI Act non-compliance actually costs — the penalty structure, what's already in force, and what phases in through 2026.",
  openGraph: {
    title: "EU AI Act Exposure — Tioga AI",
    description: "The penalty structure, what's already in force, and what phases in through 2026.",
  },
};

const TIERS = [
  {
    amount: "€35M or 7%",
    label: "of global annual turnover, whichever is higher",
    scope: "Prohibited AI practices",
    detail: "Article 5 violations — the highest tier. These provisions have been in force since February 2025.",
    status: "In force",
    statusColor: "var(--error)",
  },
  {
    amount: "€15M or 3%",
    label: "of global annual turnover, whichever is higher",
    scope: "High-risk system & GPAI provider obligations",
    detail: "Non-compliance with the requirements for high-risk AI systems or general-purpose AI model obligations.",
    status: "Phasing in",
    statusColor: "var(--warning)",
  },
  {
    amount: "€7.5M or 1%",
    label: "of global annual turnover, whichever is higher",
    scope: "Incorrect or incomplete information",
    detail: "Supplying incorrect, incomplete, or misleading information to regulators or notified bodies.",
    status: "Phasing in",
    statusColor: "var(--warning)",
  },
];

export default function EUAIActPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#EF444415", border: "1px solid #EF444430", color: "var(--error)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Regulatory exposure
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          What EU AI Act non-compliance<br />
          <span style={{ color: "var(--accent)" }}>actually costs</span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-16">
          Enterprises with any EU exposure now carry material financial risk
          from AI systems, whether or not they built those systems in-house.
          Here&apos;s the penalty structure as written into the Act, and what&apos;s
          already enforceable today versus what phases in.
        </p>

        {/* Penalty tiers */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6">Three penalty tiers, Article 99</h2>
          <div className="space-y-4">
            {TIERS.map((t) => (
              <div key={t.scope} className="p-6 rounded-2xl flex flex-col md:flex-row md:items-center gap-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="md:w-56 shrink-0">
                  <p className="text-2xl font-bold text-white leading-tight">{t.amount}</p>
                  <p className="text-xs text-slate-400 mt-1">{t.label}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{t.scope}</h3>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: t.statusColor, background: `${t.statusColor}15`, border: `1px solid ${t.statusColor}30` }}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Whichever figure is higher applies to large enterprises; SMEs and
            startups face the lower of the two amounts in each tier.
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-16 p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="text-lg font-bold text-white mb-4">What&apos;s already live vs. what&apos;s coming</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="text-xs font-mono text-slate-400 w-24 shrink-0 pt-0.5">Feb 2025</span>
              <p className="text-sm text-slate-400">Prohibited-practice provisions and AI literacy obligations took effect — the €35M/7% tier is already enforceable.</p>
            </div>
            <div className="flex gap-4">
              <span className="text-xs font-mono text-slate-400 w-24 shrink-0 pt-0.5">Aug 2025</span>
              <p className="text-sm text-slate-400">General-purpose AI model provider obligations and governance-authority designations took effect.</p>
            </div>
            <div className="flex gap-4">
              <span className="text-xs font-mono text-white w-24 shrink-0 pt-0.5">Aug 2026</span>
              <p className="text-sm text-slate-300">High-risk system obligations (Annex III — the category most enterprise AI agents in finance, HR, and CRM fall into) and Article 50 transparency requirements (AI-generated content disclosure, chatbot disclosure) phase in — the deadline most mid-market enterprises still have open exposure against.</p>
            </div>
            <div className="flex gap-4">
              <span className="text-xs font-mono text-slate-400 w-24 shrink-0 pt-0.5">Aug 2027</span>
              <p className="text-sm text-slate-400">High-risk systems that are safety components of products already regulated under existing EU product-safety law (Annex I — machinery, medical devices, and similar) get a one-year later deadline.</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Dates per the EU AI Act&apos;s official timeline; not legal advice.
            Confirm applicability for your specific system with counsel. Reviewed 2026-07-27.
          </p>
        </div>

        {/* ISO 42001 note */}
        <div className="mb-16 p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC08)", border: "1px solid #00D4FF30" }}>
          <h2 className="text-lg font-bold text-white mb-2">Where ISO 42001 fits in</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            ISO 42001 certification isn&apos;t itself an EU AI Act requirement,
            but it&apos;s emerging as the proof point enterprise buyers use to
            screen whether a vendor&apos;s governance claims are real rather
            than self-reported — reason enough to build toward it even before
            certification is complete.
          </p>
          <a href="/trust/framework-mapping" className="text-sm hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
            See how NIST AI RMF, ISO 42001, and the EU AI Act line up →
          </a>
        </div>

        {/* Calculator CTA */}
        <div className="mb-10 p-6 rounded-2xl text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="text-lg font-bold text-white mb-2">Not sure which tier applies to you?</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-md mx-auto">
            A quick, rules-based check — select what your AI system does, get
            the likely risk tier and penalty exposure.
          </p>
          <a
            href="/trust/eu-ai-act/calculator"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Run the readiness calculator →
          </a>
        </div>

        {/* Offer tie-in */}
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-4">
            Tioga AI&apos;s EU AI Act Conformity Program covers Article 50 /
            state-law readiness and full conformity documentation.
          </p>
          <a
            href="/services"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            See the Conformity Program →
          </a>
        </div>
      </section>
    </main>
  );
}
