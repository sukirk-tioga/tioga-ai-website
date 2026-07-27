import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Built the Migration Assessment Demo",
  description:
    "Why the EBS to S/4HANA migration assessment runs on a reasoning model behind a strict input allowlist, with conditional compliance logic and clamped output.",
  openGraph: {
    title: "How We Built the Migration Assessment Demo — Tioga AI",
    description: "A reasoning model behind a strict allowlist, conditional compliance logic, and clamped output.",
  },
};

export default function MigrationAssessmentWriteup() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "#0A0F1C" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <a href="/engineering" className="text-xs mb-6 inline-block hover:text-white transition-colors" style={{ color: "#00D4FF" }}>
          ← How We Built It
        </a>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ color: "#00D4FF", background: "#00D4FF15", border: "1px solid #00D4FF30" }}>
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
            <pre className="p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed" style={{ background: "#060B14", border: "1px solid #1E2D4A", color: "#94a3b8" }}>
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
                  <span style={{ color: "#00D4FF" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Design decisions callout */}
          <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC08)", border: "1px solid #00D4FF30" }}>
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
        </div>

        <div className="mt-16 text-center">
          <a
            href="/demos/migration-assessment"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            Try the live assessment →
          </a>
        </div>
      </section>
    </main>
  );
}
