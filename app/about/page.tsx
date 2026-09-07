import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Tioga AI is built by its founder — decades in enterprise systems and governance, now building AI agents on the same terrain, with compliance built in from day one.",
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
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Who&apos;s behind Tioga AI
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: "var(--text)" }}>
          Built by one person.<br />
          <span style={{ color: "var(--accent)" }}>Run against real systems.</span>
        </h1>

        <div className="space-y-5 text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mb-14">
          <p>
            I&apos;m the founder of Tioga AI. I spent decades on the
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
            Before founding Tioga AI, I managed the governance work that
            keeps ERP, HR, and CRM systems audit-ready across four sister
            companies — not AI-specific compliance theory, the actual
            operating discipline this practice is built on.
          </p>
          <p>
            Tioga AI is a solo practice by design, at least for now. Every
            live demo on this site is code I wrote and infrastructure I run —
            including the governance ledger, which isn&apos;t a mockup but a
            real excerpt from the routing gateway this business runs on
            internally. What you see here is what shipped, not what&apos;s planned.
          </p>
        </div>

        {/* Disclosure: names the missing-credentials gap directly instead of
            leaving it silently empty — same honesty mechanic as the
            homepage's demo band and the Trust page's compliance-status
            block. Added 2026-09-01 per the design canvas. */}
        <div
          className="rounded-2xl p-6 mb-14 flex flex-col sm:flex-row gap-4"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-mono uppercase tracking-wide shrink-0 sm:w-40" style={{ color: "var(--text-muted)" }}>
            On verification
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            You&apos;ll notice what&apos;s missing from this page: a dated career timeline, a LinkedIn link, referenceable client names. I&apos;m still assembling the version of that record I&apos;m willing to publish — one where every line can be checked. Until it&apos;s verifiable, it doesn&apos;t go on the site. In the meantime, the demos and the Governance Ledger are the credentials I can prove today, and a{" "}
            <Link href="/discovery-sprint" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors">
              Discovery Sprint
            </Link>{" "}
            is the fastest way to test the rest — or the{" "}
            <Link href="/ai-fit-check" style={{ color: "var(--accent)" }} className="hover:text-[var(--text)] transition-colors">
              AI Fit Check
            </Link>{" "}
            if you want a cheaper, lower-commitment first look.
          </p>
        </div>

        {/* Pillars */}
        <div className="mb-14">
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Dual fluency, not one or the other</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6 max-w-2xl">
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
                <h3 className="font-semibold mb-2" style={{ color: "var(--text)" }}>{p.label}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wedge */}
        <div
          className="rounded-2xl p-8 mb-14"
          style={{ background: "linear-gradient(135deg, #C8340608, #A5000008)", border: "1px solid #C8340630" }}
        >
          <p className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>
            &ldquo;Without ripping out what works.&rdquo;
          </p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
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
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>See it, don&apos;t take my word for it</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <a
              href="/demos/migration-assessment"
              className="p-4 rounded-xl transition-all hover:border-slate-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Migration Assessment →</p>
              <p className="text-xs text-[var(--text-muted)]">A live EBS → S/4HANA readiness agent, running against real assessment logic.</p>
            </a>
            <a
              href="/demos/governance-ledger"
              className="p-4 rounded-xl transition-all hover:border-slate-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Governance Ledger →</p>
              <p className="text-xs text-[var(--text-muted)]">Real operational data from the AI routing gateway this business runs on.</p>
            </a>
            <a
              href="/changelog"
              className="p-4 rounded-xl transition-all hover:border-slate-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>Build Log →</p>
              <p className="text-xs text-[var(--text-muted)]">What&apos;s actually shipped on this site, in order, since launch.</p>
            </a>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a
            href="/contact"
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
