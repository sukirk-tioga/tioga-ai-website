import type { Metadata } from "next";
import Link from "next/link";
import BenchmarkCard from "@/components/BenchmarkCard";
import { TOTAL_CALLS, PAID_COUNT, FREE_ZERO_COST_COUNT, FREE_ZERO_COST_PCT } from "@/lib/governance-ledger";
import { EvidenceTierTag } from "@/app/demos/_lib/evidence-tier";

export const metadata: Metadata = {
  title: "How I Built the Governance Ledger Demo",
  description:
    "Why the Governance Ledger demo is a dated snapshot instead of a live feed, how the NIST AI RMF mapping falls out of the routing gateway's own design, and what runs with no model call at all.",
  alternates: { canonical: "/engineering/governance-ledger" },
  openGraph: {
    title: "How I Built the Governance Ledger Demo — Tioga AI",
    description: "A real ledger excerpt, a framework the infra was built against — not retrofitted to — and zero prompt-injection surface.",
  },
};

export default function GovernanceLedgerWriteup() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <Link href="/engineering" className="text-xs mb-6 inline-block hover:text-[var(--text)] transition-colors" style={{ color: "var(--accent)" }}>
          ← How I Built It
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ color: "var(--accent)", background: "#C8340615", border: "1px solid #C8340630" }}>
            No model call
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-6 leading-tight" style={{ color: "var(--text)" }}>
          How I built the Governance Ledger demo
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

        <p className="text-sm text-slate-500 mb-4">
          Last reviewed{" "}
          <time dateTime="2026-09-09">September 9, 2026</time>
        </p>
        <EvidenceTierTag
          tier="internal-operational-excerpt"
          detail="Real, dated excerpt from Tioga's own JARVIS routing gateway ledger — 16 logged calls, Sep 8–9, 2026, snapshot captured Sep 9, 2026."
        />

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>A snapshot, not a ticker — on purpose</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              The 16-row ledger and the &quot;live gateway snapshot&quot; stats above
              it are hardcoded, dated, and captured at two different times
              (the ledger rows span Sep 8–9, the snapshot is Sep 9) rather
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
              This window looks different from the one this page originally
              shipped with (captured Jul 2026), and that difference is the
              point, not an embarrassment to hide. Back then, most calls
              resolved to a free local/Google backend before touching billed
              credit. By Sep 8–9, real call volume has grown past what those
              free backends alone can absorb, so {PAID_COUNT} of the {TOTAL_CALLS} rows in this
              window route to paid OpenRouter backends
              (<code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>glm-5.2</code>,{" "}
              <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>gpt-terra</code>) —
              only {FREE_ZERO_COST_COUNT} of {TOTAL_CALLS} ({FREE_ZERO_COST_PCT}%) still settle at exactly $0 in this
              particular window. The mechanism hasn&apos;t changed: every
              request still records what was requested and what actually
              served it, and the routing policy still tries free/cheap
              backends first — it&apos;s just that there&apos;s more real traffic
              now than the free tier alone covers. Total spend for this
              16-call window is still a rounding error against the $30 cap
              (see the strip above), which is the actual claim this page
              makes — not that free tier absorbs everything forever.
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
              date: "2026-09-09",
              model: "No model call — static ledger excerpt (governance/observability data only)",
              dataSource:
                "Real excerpt from Tioga AI's own JARVIS routing gateway ledger — not synthetic, not a demo dataset.",
              sampleSize: "16 logged calls, unsampled (every call in the captured window, not a spot check)",
              metrics: [
                { label: "Calls logged", value: "16 (unsampled)" },
                { label: "Free-tier resolution", value: `${FREE_ZERO_COST_COUNT}/${TOTAL_CALLS} calls (${FREE_ZERO_COST_PCT}%) settled at exactly $0 via local/free-tier routing this window` },
                { label: "Ledger window", value: "Sep 8–9, 2026" },
                { label: "Snapshot captured", value: "Sep 9, 2026" },
              ],
              limitations: [
                "This is a fixed, dated snapshot, not a live feed — updated manually when the page is refreshed, not real-time.",
                "16 calls is Tioga's own internal AI-operations volume in this window, not a claim about the scale a client engagement would produce.",
                "Free-tier resolution varies by window with real call volume — an earlier Jul 2026 capture of this same ledger settled 12/17 (71%) at $0; this window settled fewer because volume grew past what the free backends absorb, not because the routing policy changed.",
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
