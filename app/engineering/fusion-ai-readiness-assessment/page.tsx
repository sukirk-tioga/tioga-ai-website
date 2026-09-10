import type { Metadata } from "next";
import Link from "next/link";
import BenchmarkCard from "@/components/BenchmarkCard";
import { EvidenceTierTag } from "@/app/demos/_lib/evidence-tier";

export const metadata: Metadata = {
  title: "How I Built the Fusion Cloud AI-Readiness Assessment Demo",
  description:
    "Why the Oracle Fusion Cloud AI-readiness assessment runs on a reasoning model behind a strict input allowlist, with conditional governance logic and clamped output.",
  alternates: { canonical: "/engineering/fusion-ai-readiness-assessment" },
  openGraph: {
    title: "How I Built the Fusion Cloud AI-Readiness Assessment Demo — Tioga AI",
    description: "A reasoning model behind a strict allowlist, conditional governance logic, and clamped output.",
  },
};

export default function FusionAiReadinessAssessmentWriteup() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <Link href="/engineering" className="text-xs mb-6 inline-block hover:text-[var(--text)] transition-colors" style={{ color: "var(--accent)" }}>
          ← How I Built It
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ color: "var(--accent)", background: "#C8340615", border: "1px solid #C8340630" }}>
            Claude Sonnet 5
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-6 leading-tight" style={{ color: "var(--text)" }}>
          How I built the Fusion Cloud AI-Readiness Assessment demo
        </h1>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-12">
          Given a description of an Oracle Fusion Cloud ERP environment —
          target agent use case, transaction volume, integration method, and
          which governance controls already exist — produce a readiness
          score, named gaps, and a recommended approach. Retired and rebuilt
          2026-09-10 from the site&apos;s prior Oracle EBS → S/4HANA
          migration-complexity demo, which answered a different question
          (should you leave EBS) than this one does (is it safe to run
          governed AI agents against the Fusion Cloud ERP environment you
          already have) — same reasoning-model scaffolding, new domain.
        </p>

        <p className="text-sm text-slate-500 mb-4">
          Last reviewed{" "}
          <time dateTime="2026-09-10">September 10, 2026</time>
        </p>
        <EvidenceTierTag
          tier="model-demonstration"
          detail="Claude Sonnet 5 reasons live, via the production endpoint, over the allowlisted Fusion Cloud ERP scenario a visitor selects; it does not connect to a live Fusion tenant — that's a planned Phase B follow-up, not yet built."
        />

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>Nothing but enums reaches the prompt</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Every input — agent use case, transaction volume, integration
              method, governance controls — is validated against a fixed
              allowlist before anything is assembled into a prompt:
            </p>
            <pre className="p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed" style={{ background: "var(--bg-darker)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
{`const USE_CASES = [
  "AP invoice exceptions (Fusion Payables)",
  "Procurement requisition triage (Fusion Procurement)",
  "GL journal review & anomaly detection (Fusion General Ledger)",
  "Expense report auditing (Fusion Expenses)",
] as const;
const VOLUMES = ["<1,000/month", "1,000–10,000/month",
                  "10,000–100,000/month", "100,000+/month"] as const;
const INTEGRATION_METHODS = ["No integration yet — planning phase",
  "Calling Fusion REST APIs directly",
  "Oracle Integration Cloud (OIC) as middleware",
  "Oracle AI Agent Studio (business-object + deep-link tools)"] as const;`}
            </pre>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-4">
              There&apos;s no free-text field anywhere in this form. A public demo
              endpoint that accepts arbitrary text and feeds it to a system
              prompt is a prompt-injection surface; a form that only accepts
              membership in a known set removes that surface entirely rather
              than trying to sanitize around it.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>The prompt reasons about the specific selection</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              The system prompt frames Claude as a senior AI-governance
              architect and explicitly instructs it to reference real Fusion
              Cloud ERP concepts for the use case actually selected —
              Payables invoice holds and matching for AP exceptions,
              supplier and purchase-order approval for procurement triage,
              chart-of-accounts and period-close controls for GL review —
              rather than returning generic AI-governance advice that would
              apply to any input. One conditional line does real work: if
              fewer than two governance controls are already selected as in
              place, the prompt requires the response to call that out as a
              structural blocker to autonomous agent action, not a minor
              gap to note in passing.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>The response is validated, not trusted</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Structured output from a model is still a string until proven
              otherwise. Before anything reaches the client:
            </p>
            <ul className="space-y-2.5">
              {[
                "Code fences are stripped and the outermost JSON object is extracted defensively — models sometimes wrap output in commentary even under instruction not to.",
                "readinessScore is clamped into the 1–10 range with Math.min/Math.max, and rejected outright if it isn't a finite number.",
                "recommendedApproach.approach is lowercased and checked against exactly three allowed values (pilot-ready / needs-guardrails / not-ready) — anything else fails the request rather than silently passing through.",
                "keyGaps and nextSteps are truncated to 3 items regardless of how many the model returns, keeping the response shape predictable for the UI.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--text-muted)] leading-relaxed">
                  <span style={{ color: "var(--accent)" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Design decisions callout */}
          <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #C8340608, #A5000008)", border: "1px solid #C8340630" }}>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>Why Sonnet, and why 5 requests per 10 minutes</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              This is the one demo on the site running Claude Sonnet 5 with
              extended thinking explicitly disabled — the reasoning load
              (weighing use case against transaction volume against which
              governance controls already exist to produce a specific,
              defensible recommendation) is real, but this use case
              doesn&apos;t need multi-step deliberation to get there. It also
              gets the tightest rate limit on the site — 5 requests per 10
              minutes per IP, against 30 requests per day for the extraction
              demos — because a reasoning-model call costs meaningfully more
              than a Haiku extraction call, and a public demo endpoint has
              to assume it will be hit by more than curious visitors.
            </p>
          </div>

          <BenchmarkCard
            data={{
              date: "2026-09-10",
              model: "Claude Sonnet 5 (extended thinking disabled)",
              dataSource:
                "4 distinct Fusion Cloud ERP use-case / integration-method / governance-control combinations, run live against the production endpoint at tioga.ai.",
              sampleSize: "4 configurations attempted; 3 completed (see limitations)",
              metrics: [
                { label: "Schema-valid responses", value: "3/3 completed runs (100%)" },
                { label: "Thin-controls disclosure rule followed", value: "1/1 confirmed applicable case" },
                { label: "Average latency", value: "~14s" },
                { label: "Rate limit enforced", value: "Confirmed: 5 requests / 10 min per IP" },
              ],
              limitations: [
                "This is a reasoning/judgment task, not classification — there's no single \"correct\" readiness score to measure accuracy against. The metrics above check structural reliability (valid output, disclosure-instruction adherence), not correctness of the recommendation itself.",
                "One test case was rejected by the demo's own 5-requests/10-minute rate limit during this benchmark run — a real constraint, not a bug.",
                "Readiness scores haven't been validated against real agent-deployment outcomes; treat them as directional, not calibrated.",
              ],
            }}
          />
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/demos/fusion-ai-readiness-assessment"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Try the live assessment →
          </Link>
        </div>
      </section>
    </main>
  );
}
