import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Built It",
  description:
    "Engineering writeups behind Tioga AI's live demos — model choices, validation, rate limiting, and the decisions that separate a working prototype from something safe to run in production.",
  openGraph: {
    title: "How We Built It — Tioga AI",
    description: "Engineering writeups behind the live demos — no black box.",
  },
};

const WRITEUPS = [
  {
    href: "/engineering/governance-ledger",
    title: "Governance Ledger",
    model: "No model call",
    summary: "Why this is a dated ledger excerpt instead of a live feed, how the NIST AI RMF mapping falls out of the routing gateway's own schema, and the one demo with zero prompt-injection surface.",
  },
  {
    href: "/engineering/invoice-processing",
    title: "Invoice Processing",
    model: "Claude Haiku 4.5",
    summary: "A shared PDF/DOCX/text extraction pipeline feeding a structured-JSON extraction prompt — and why this one didn't need a reasoning model.",
  },
  {
    href: "/engineering/email-triage",
    title: "Email Triage",
    model: "Claude Haiku 4.5",
    summary: "Classification, routing, and reply-drafting in one call — and the enum-constrained prompt design that keeps the output usable without a parser fighting free text.",
  },
  {
    href: "/engineering/migration-assessment",
    title: "Migration Assessment",
    model: "Claude Sonnet 5",
    summary: "Why this demo runs on a reasoning model behind a strict allowlist, with conditional compliance logic and clamped, validated output — the most defensive route on the site.",
  },
];

export default function EngineeringIndexPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          How We Built It
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          No black box.
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-16">
          Every demo on this site is a real, deployed route — not a mockup. Here&apos;s
          the actual engineering behind each one: which model it runs on and
          why, how untrusted input is constrained before it reaches a prompt,
          and where the defensive code lives.
        </p>

        <div className="space-y-4">
          {WRITEUPS.map((w) => (
            <a
              key={w.href}
              href={w.href}
              className="block p-6 rounded-2xl transition-all hover:border-slate-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h2 className="text-lg font-semibold text-white">{w.title}</h2>
                    <span
                      className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                      style={{ color: "var(--accent)", background: "#00D4FF15", border: "1px solid #00D4FF30" }}
                    >
                      {w.model}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xl">{w.summary}</p>
                </div>
                <span className="text-sm shrink-0" style={{ color: "var(--accent)" }}>Read →</span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-slate-400 mb-4">
            Prefer the running history?{" "}
            <a href="/changelog" style={{ color: "var(--accent)" }} className="hover:text-white transition-colors">
              See the build log →
            </a>
          </p>
          <a
            href="/demos"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Try the live demos
          </a>
        </div>
      </section>
    </main>
  );
}
