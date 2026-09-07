import type { Metadata } from "next";
import Link from "next/link";
import BenchmarkCard from "@/components/BenchmarkCard";
import { TOTAL_CALLS, FREE_ZERO_COST_COUNT, FREE_ZERO_COST_PCT } from "@/lib/governance-ledger";

export const metadata: Metadata = {
  title: "How We Built the Governance Ledger Demo",
  description:
    "Why the Governance Ledger demo is a dated snapshot instead of a live feed, how the NIST AI RMF mapping falls out of the routing gateway's own design, and what runs with no model call at all.",
  alternates: { canonical: "/engineering/governance-ledger" },
  openGraph: {
    title: "How We Built the Governance Ledger Demo — Tioga AI",
    description: "A real ledger excerpt, a framework the infra was built against — not retrofitted to — and zero prompt-injection surface.",
  },
};

export default function GovernanceLedgerWriteup() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <Link href="/engineering" className="text-xs mb-6 inline-block hover:text-[var(--text)] transition-colors" style={{ color: "var(--accent)" }}>
          ← How We Built It
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ color: "var(--accent)", background: "#C8340615", border: "1px solid #C8340630" }}>
            No model call
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-6 leading-tight" style={{ color: "var(--text)" }}>
          How we built the Governance Ledger demo
        </h1>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-12">
          The other three demos on this site take an input and run it through
          a model live. This one doesn&apos;t take an input at all — it&apos;s a
          real, dated excerpt from the routing ledger that Tioga&apos;s own AI
          infrastructure (JARVIS) writes to on every call it makes, anywhere,
          for any purpose. The interesting engineering here isn&apos;t a
          prompt; it&apos;s what the ledger had to look like for this page to
          be honest.
        </p>

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>A snapshot, not a ticker — on purpose</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              The 17-row ledger and the &quot;live gateway snapshot&quot; stats above
              it are hardcoded, dated, and captured at two different times
              (the ledger rows span Jul 17–25, the snapshot is Jul 27) rather
              than fetched from a live endpoint on page load. That&apos;s a
              deliberate tradeoff, not a shortcut: a public demo page that
              live-queries an internal cost/routing gateway is an unnecessary
              exposed surface for zero real benefit — visitors don&apos;t need
              millisecond freshness on someone else&apos;s infrastructure spend,
              they need to see the shape of what gets logged. The two
              timestamps are labeled separately in the UI instead of merged
              into one implied &quot;live&quot; number, so the distinction between
              &quot;real excerpt&quot; and &quot;real-time&quot; stays honest rather than
              blurred for effect.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>The NIST mapping falls out of the schema, not the copy</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              GOVERN / MAP / MEASURE / MANAGE aren&apos;t a label applied to this
              page after the fact — they&apos;re fields the gateway already
              records on every call: <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>policy: budget.json</code> for
              GOVERN, <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>model → served_model</code> for
              MAP, token/cost/quality fields for MEASURE, and a
              reserve-then-charge budget check for MANAGE. The page just
              renders what the ledger schema already tracked. That ordering
              matters for the offers this demo backs (governed ERP write-path,
              insurance-underwriting evidence, cost/model governance
              assessments) — the pitch is that governance evidence is a
              byproduct of how the infrastructure is built, not a report
              generated to satisfy an auditor after the fact.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>What &quot;requested → served&quot; is actually showing</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Most rows show a cheap model name requested (<code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>glm-flash</code>)
              resolving to a different model actually serving it
              (<code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>qwen/qwen3-8b</code>) at $0.000000 —
              that&apos;s the routing policy working: local/free-tier backends
              absorb calls before anything touches billed credit, and the
              ledger records both the request and the resolution so that
              substitution is auditable rather than invisible. {FREE_ZERO_COST_COUNT} of the {TOTAL_CALLS}
              rows in this excerpt settled at exactly $0 for that reason — the
              other 3 free-pool rows resolved to a Gemini backend that still
              carries a fraction-of-a-cent cost, so they route free but aren&apos;t
              zero-cost — consistent with the &quot;{FREE_ZERO_COST_PCT}%&quot; stat in the
              strip above it, which is computed from the same rows, not
              asserted separately.
            </p>
          </div>

          {/* Design decisions callout */}
          <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #C8340608, #A5000008)", border: "1px solid #C8340630" }}>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>Why this is the one demo with no prompt-injection surface</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Every other demo on this site accepts either a constrained form
              or a file upload, and the corresponding writeup spends real
              space on how untrusted input is validated before it reaches a
              model. This page has no input field and calls no model at
              request time — it renders a static array shipped in the page
              bundle. There&apos;s nothing to sanitize because there&apos;s no path
              from a visitor&apos;s browser to a prompt at all. That&apos;s not a
              gap in this demo; it&apos;s the correct shape for what it&apos;s
              actually demonstrating — operational governance data, not a
              live inference endpoint.
            </p>
          </div>

          <BenchmarkCard
            data={{
              date: "2026-07-27",
              model: "No model call — static ledger excerpt (governance/observability data only)",
              dataSource:
                "Real excerpt from Tioga AI's own JARVIS routing gateway ledger — not synthetic, not a demo dataset.",
              sampleSize: "17 logged calls, unsampled (every call in the captured window, not a spot check)",
              metrics: [
                { label: "Calls logged", value: "17 (unsampled)" },
                { label: "Free-tier resolution", value: `${FREE_ZERO_COST_COUNT}/${TOTAL_CALLS} calls (${FREE_ZERO_COST_PCT}%) settled at exactly $0 via local/free-tier routing` },
                { label: "Ledger window", value: "Jul 17–25, 2026" },
                { label: "Snapshot captured", value: "Jul 27, 2026" },
              ],
              limitations: [
                "This is a fixed, dated snapshot, not a live feed — updated manually when the page is refreshed, not real-time.",
                "17 calls is Tioga's own internal AI-operations volume in this window, not a claim about the scale a client engagement would produce.",
                "Demonstrates the pattern (governance data as a byproduct of routing infrastructure), not a benchmark of model accuracy or task performance — there's no task being scored here.",
              ],
            }}
          />
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/demos/governance-ledger"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            View the live ledger excerpt →
          </Link>
        </div>
      </section>
    </main>
  );
}
