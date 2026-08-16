import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Tioga AI is built by Sukir Kumaresan — decades in enterprise systems and governance, now building AI agents on the same terrain, with compliance built in from day one.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Tioga AI",
    description:
      "Decades in enterprise systems and governance, now building AI agents on the same terrain.",
  },
};

const PILLARS = [
  {
    label: "Enterprise systems",
    body: "Oracle EBS, SAP, finance, HR, procurement — the operational core most AI vendors have never had to touch, let alone integrate against.",
  },
  {
    label: "Hands-on AI engineering",
    body: "Every demo on this site — the migration assessment, the governance ledger, the MCP connectors — is built and run by the same person writing this page. Not a slide, not an outsourced dev shop.",
  },
  {
    label: "AI governance",
    body: "NIST AI RMF, ISO 42001, EU AI Act — treated as engineering requirements to design against, not paperwork to backfill after a pilot succeeds.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Who&apos;s behind Tioga AI
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Built by one person.<br />
          <span style={{ color: "var(--accent)" }}>Run against real systems.</span>
        </h1>

        <div className="space-y-5 text-lg text-slate-300 leading-relaxed max-w-2xl mb-14">
          <p>
            I&apos;m Sukir Kumaresan, founder of Tioga AI. I spent decades on the
            operating side of enterprise systems — Oracle EBS, SAP, finance,
            HR, procurement, and the governance and compliance work that keeps
            all of it audit-ready. Not consulting from the outside: running it.
          </p>
          <p>
            That&apos;s the terrain I&apos;m building AI agents on now. Most AI
            vendors can demo a chatbot; few have ever had to reconcile a
            general ledger, navigate an ERP&apos;s custom auth layer, or sit
            in a compliance review. Tioga AI exists because that gap — between
            AI that looks impressive and AI that survives contact with a real
            enterprise system — is exactly where I&apos;ve spent my career.
          </p>
          <p>
            Tioga AI is a solo practice by design, at least for now. Every
            live demo on this site is code I wrote and infrastructure I run —
            including the governance ledger, which isn&apos;t a mockup but a
            real excerpt from the routing gateway this business runs on
            internally. What you see here is what shipped, not what&apos;s planned.
          </p>
        </div>

        {/* Pillars */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-white mb-2">Dual fluency, not one or the other</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-2xl">
            Most consultancies bring one of these three. Tioga AI is built on
            the premise that enterprise AI only works in production when all
            three are held by the same team.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PILLARS.map((p) => (
              <div
                key={p.label}
                className="p-5 rounded-2xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h3 className="font-semibold text-white mb-2">{p.label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wedge */}
        <div
          className="rounded-2xl p-8 mb-14"
          style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC08)", border: "1px solid #00D4FF30" }}
        >
          <p className="text-lg text-white font-semibold mb-2">
            &ldquo;Without ripping out what works.&rdquo;
          </p>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            The systems your business runs on today — the ERP, the CRM, the
            HRIS — are not the problem. They&apos;re the asset. Tioga AI builds
            AI agents that connect to them as they are, with governance
            controls designed in from the start, instead of asking you to
            replace what already works. Those controls persist, too — every
            agent retains your approval chains and policy context run over
            run, instead of re-learning your environment from a blank slate
            every session, the way a generic chatbot tool does.
          </p>
        </div>

        {/* Proof links */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-4">See it, don&apos;t take my word for it</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <a
              href="/demos/migration-assessment"
              className="p-4 rounded-xl transition-all hover:border-slate-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-semibold text-white mb-1">Migration Assessment →</p>
              <p className="text-xs text-slate-400">A live EBS → S/4HANA readiness agent, running against real assessment logic.</p>
            </a>
            <a
              href="/demos/governance-ledger"
              className="p-4 rounded-xl transition-all hover:border-slate-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-semibold text-white mb-1">Governance Ledger →</p>
              <p className="text-xs text-slate-400">Real operational data from the AI routing gateway this business runs on.</p>
            </a>
            <a
              href="/changelog"
              className="p-4 rounded-xl transition-all hover:border-slate-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-semibold text-white mb-1">Build Log →</p>
              <p className="text-xs text-slate-400">What&apos;s actually shipped on this site, in order, since launch.</p>
            </a>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a
            href="/#contact"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Start a conversation
          </a>
        </div>
      </section>
    </main>
  );
}
