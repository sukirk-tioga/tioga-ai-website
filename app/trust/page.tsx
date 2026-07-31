import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust & Governance",
  description:
    "How Tioga AI builds NIST AI RMF, ISO 42001, and EU AI Act governance into AI agents from the start — not as documentation added after a pilot succeeds.",
  openGraph: {
    title: "Trust & Governance — Tioga AI",
    description:
      "Governance built into the architecture, not bolted on — mapped to NIST AI RMF, ISO 42001, and the EU AI Act.",
  },
};

const FRAMEWORKS = [
  {
    name: "NIST AI RMF",
    tag: "US federal framework",
    body: "The four-function model — Govern, Map, Measure, Manage — that structures how we design every agent's logging, cost controls, and human oversight from day one.",
    offer: "AI Governance Readiness Assessment",
    price: "$20–35K",
    href: "/trust/framework-mapping",
    linkText: "See how it maps to ISO 42001 and the EU AI Act →",
  },
  {
    name: "ISO 42001",
    tag: "International standard",
    body: "The AI management system standard for organizations that need certification-ready documentation, not just internal policy — audit trail structured for a third-party assessor.",
    offer: "ISO 42001 Implementation Sprint",
    price: "$50–120K",
    href: "/trust/framework-mapping",
    linkText: "See how it maps to NIST AI RMF and the EU AI Act →",
  },
  {
    name: "EU AI Act",
    tag: "EU regulation",
    body: "Risk-tiering, conformity documentation, and technical files for organizations with EU exposure — including the Article 50 transparency obligations phasing in through 2026.",
    offer: "EU AI Act Conformity Program",
    price: "$75–200K",
    href: "/trust/eu-ai-act",
    linkText: "What non-compliance costs →",
  },
];

const FUNCTIONS = [
  {
    name: "GOVERN",
    body: "A spend policy and oversight structure set once and enforced automatically on every model call — not a quarterly review that discovers drift after the fact.",
  },
  {
    name: "MAP",
    body: "Every AI action records what was requested and what actually executed it. No call happens without a named model and a named route.",
  },
  {
    name: "MEASURE",
    body: "Token volume, cost, and output quality are recorded on every call — unsampled, not a spot check run once a quarter.",
  },
  {
    name: "MANAGE",
    body: "Spend and risk are checked and reserved before an action executes — the system is architecturally incapable of the failure mode, not just monitored for it.",
  },
];

export default function TrustPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Trust &amp; Governance
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Governance built in.<br />
          <span style={{ color: "var(--accent)" }}>Not bolted on.</span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-16">
          Most AI vendors treat governance as documentation written after a
          pilot works. We design the logging, cost controls, and human
          oversight into the architecture first — so the compliance artifact
          is a byproduct of how the system runs, not a separate deliverable
          bolted on afterward.
        </p>

        {/* Framework cards */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2">The three frameworks we build against</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-2xl">
            Each maps to a productized offer — a concrete deliverable and
            timeline, not an open-ended retainer.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {FRAMEWORKS.map((f) => (
              <div key={f.name} className="p-6 rounded-2xl flex flex-col" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{f.tag}</p>
                <h3 className="text-lg font-bold text-white mb-3">{f.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-1">{f.body}</p>
                <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="text-xs text-slate-500 mb-0.5">Mapped offer</p>
                  <p className="text-sm font-semibold text-white">{f.offer}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--accent)" }}>{f.price}</p>
                  {f.href && (
                    <a href={f.href} className="inline-block text-xs mt-3 hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
                      {f.linkText}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAP/MEASURE/MANAGE/GOVERN */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2">How this shows up in the architecture</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-2xl">
            The NIST AI RMF&apos;s four functions, expressed as engineering
            requirements rather than compliance checklist items.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {FUNCTIONS.map((f) => (
              <div key={f.name} className="p-5 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold tracking-wide mb-1.5" style={{ color: "var(--accent)" }}>{f.name}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live proof */}
        <div
          className="rounded-2xl p-8 mb-16"
          style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC08)", border: "1px solid #00D4FF30" }}
        >
          <h2 className="text-xl font-bold text-white mb-3">Don&apos;t take this on faith</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-5 max-w-2xl">
            The Governance Ledger demo isn&apos;t a mockup. It&apos;s a real,
            unedited excerpt of the AI routing gateway this business runs its
            own infrastructure on — every call logged, costed, and mapped to
            the four functions above, live.
          </p>
          <a
            href="/demos/governance-ledger"
            className="inline-flex px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            See the live ledger →
          </a>
        </div>

        {/* All offers */}
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-4">
            Ten of Tioga AI&apos;s thirteen engagements are governance-focused.
          </p>
          <a
            href="/services"
            className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-white inline-block"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            See all thirteen offers →
          </a>
        </div>
      </section>
    </main>
  );
}
