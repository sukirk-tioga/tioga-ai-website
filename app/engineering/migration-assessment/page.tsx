import type { Metadata } from "next";
import Link from "next/link";
import BenchmarkCard from "@/components/BenchmarkCard";

export const metadata: Metadata = {
  title: "How We Built the Migration Assessment Demo",
  description:
    "Why the EBS to S/4HANA migration assessment runs on a reasoning model behind a strict input allowlist, with conditional compliance logic and clamped output.",
  alternates: { canonical: "/engineering/migration-assessment" },
  openGraph: {
    title: "How We Built the Migration Assessment Demo — Tioga AI",
    description: "A reasoning model behind a strict allowlist, conditional compliance logic, and clamped output.",
  },
};

export default function MigrationAssessmentWriteup() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <Link href="/engineering" className="text-xs mb-6 inline-block hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
          ← How We Built It
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ color: "var(--accent)", background: "#EC6D3D15", border: "1px solid #EC6D3D30" }}>
            Claude Sonnet 5
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
          How we built the Migration Assessment demo
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed mb-12">
          Given an Oracle EBS footprint — version, modules, data volume,
          target SAP edition — produce a complexity score, a conservative
          timeline, named risks, and a recommended approach. This is the
          most defensive route on the site, and deliberately so: it&apos;s
          reasoning about a client&apos;s actual system, not extracting
          fields from a document they uploaded.
        </p>

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-3">Nothing but enums reaches the prompt</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Every input — EBS version, modules, data volume, target
              edition — is validated against a fixed allowlist before
              anything is assembled into a prompt:
            </p>
            <pre className="p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed" style={{ background: "var(--bg-darker)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
{`const VERSIONS = ["R12.1", "R12.2"] as const;
const MODULES  = ["FI", "AP", "AR", "GL", "FA", "INV", "PO"] as const;
const VOLUMES  = ["1-10GB", "10-100GB", "100GB-1TB", "1TB+"] as const;
const TARGETS  = ["S/4HANA Cloud", "S/4HANA Private Cloud",
                   "S/4HANA On-Premise"] as const;`}
            </pre>
            <p className="text-sm text-slate-400 leading-relaxed mt-4">
              There&apos;s no free-text field anywhere in this form. A public demo
              endpoint that accepts arbitrary text and feeds it to a system
              prompt is a prompt-injection surface; a form that only accepts
              membership in a known set removes that surface entirely rather
              than trying to sanitize around it.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">The prompt reasons about the specific selection</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              The system prompt frames Claude as a senior migration architect
              and explicitly instructs it to reference the modules actually
              selected — open AP/AR reconciliation, FA depreciation history
              conversion, GL chart-of-accounts redesign — rather than
              returning generic migration advice that would apply to any
              input. One conditional line does real work: if the selected
              modules include FI, GL, or AP, the prompt requires the response
              to explicitly address SOX compliance and audit-trail
              preservation. Financial-module migrations carry that
              compliance burden; inventory-only migrations don&apos;t, and the
              prompt reflects that instead of bolting a generic disclaimer
              onto every response.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">The response is validated, not trusted</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Structured output from a model is still a string until proven
              otherwise. Before anything reaches the client:
            </p>
            <ul className="space-y-2.5">
              {[
                "Code fences are stripped and the outermost JSON object is extracted defensively — models sometimes wrap output in commentary even under instruction not to.",
                "complexityScore is clamped into the 1–10 range with Math.min/Math.max, and rejected outright if it isn't a finite number.",
                "recommendedApproach.approach is lowercased and checked against exactly three allowed values (greenfield / brownfield / selective) — anything else fails the request rather than silently passing through.",
                "topRisks and nextSteps are truncated to 3 items regardless of how many the model returns, keeping the response shape predictable for the UI.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                  <span style={{ color: "var(--accent)" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Design decisions callout */}
          <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #EC6D3D08, #C8340608)", border: "1px solid #EC6D3D30" }}>
            <h2 className="text-lg font-bold text-white mb-3">Why Sonnet, and why 5 requests per 10 minutes</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              This is the one demo on the site running Claude Sonnet 5 with
              extended thinking explicitly disabled — the reasoning load
              (weighing module mix against data volume against target
              edition to produce a specific, defensible recommendation) is
              real, but this use case doesn&apos;t need multi-step deliberation
              to get there. It also gets the tightest rate limit on the site
              — 5 requests per 10 minutes per IP, against 30 requests per day
              for the extraction demos — because a reasoning-model call
              costs meaningfully more than a Haiku extraction call, and a
              public demo endpoint has to assume it will be hit by more than
              curious visitors.
            </p>
          </div>

          <BenchmarkCard
            data={{
              date: "2026-08-02",
              model: "Claude Sonnet 5 (extended thinking disabled)",
              dataSource:
                "4 distinct Oracle EBS module / data-volume / target-edition combinations, run live against the production endpoint at tioga.ai.",
              sampleSize: "4 configurations attempted; 3 completed (see limitations)",
              metrics: [
                { label: "Schema-valid responses", value: "3/3 completed runs (100%)" },
                { label: "SOX-disclosure rule followed", value: "1/1 confirmed applicable case" },
                { label: "Average latency", value: "~14.6s" },
                { label: "Rate limit enforced", value: "Confirmed: 5 requests / 10 min per IP" },
              ],
              limitations: [
                "This is a reasoning/judgment task, not classification — there's no single \"correct\" complexity score or timeline to measure accuracy against. The metrics above check structural reliability (valid output, compliance-instruction adherence), not correctness of the recommendation itself.",
                "One test case was rejected by the demo's own 5-requests/10-minute rate limit during this benchmark run — a real constraint, not a bug, but it means only 1 of 2 financial-module cases fully confirmed the SOX-disclosure instruction.",
                "Complexity scores and timelines haven't been validated against real migration outcomes; treat them as directional, not calibrated.",
              ],
            }}
          />
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/demos/migration-assessment"
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
