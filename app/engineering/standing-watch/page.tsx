import type { Metadata } from "next";
import Link from "next/link";
import BenchmarkCard from "@/components/BenchmarkCard";

export const metadata: Metadata = {
  title: "How We Built Standing Watch",
  description:
    "The real 12-day cross-machine auth gap that motivated security-watch, why every automation in this system only proposes and never applies, how POOL_WEIGHT prices non-fungible AI budgets on one basis, and what we deliberately left for a human to do by hand.",
  alternates: { canonical: "/engineering/standing-watch" },
  openGraph: {
    title: "How We Built Standing Watch — Tioga AI",
    description:
      "Propose-and-approve governance, run on our own two-machine, five-backend estate — not a claimed enterprise deployment.",
  },
};

export default function StandingWatchWriteup() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <Link href="/engineering" className="text-xs mb-6 inline-block hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
          ← How We Built It
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ color: "var(--accent)", background: "#EC6D3D15", border: "1px solid #EC6D3D30" }}>
            No model call
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
          How we built Standing Watch
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed mb-12">
          Standing Watch isn&apos;t a new system — it&apos;s a name for six
          governance disciplines we already run in production, on our own
          multi-vendor AI estate, as router-watch and security-watch. This
          page is the case study: the incident that made us build the
          cross-machine check in the first place, why nothing here is
          allowed to apply its own fixes, and the two mechanisms
          (<code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>POOL_WEIGHT</code> and
          the policy self-check we call <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>NEVER_COMPARE</code>)
          that generalize cleanly to an enterprise estate.
        </p>

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-3">
              The incident: a fix that was real on one machine and silently absent on the other for 12+ days
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Our AI estate runs across two machines — a MacBook and a Mac
              Mini — talking to five different backends. Security-watch
              exists because of a specific, real failure mode we hit before
              it existed: an authentication fix was applied and verified on
              one machine, and quietly never made it to the second. Nobody
              was lying about the state of the system; nobody was even
              looking at the second machine specifically. It just drifted,
              unauthenticated, for more than 12 days before anything caught
              it — because nothing was checking both machines identically
              on a schedule.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              That&apos;s the exact class of gap security-watch is built to
              catch: the same behavioral probe — make the real
              unauthenticated call, read the real HTTP status, don&apos;t
              trust a config file or a dashboard — run identically against
              every machine in scope, on a schedule, not just against
              whichever one someone happens to be looking at. The Aug 10,
              2026 run in the demo below is a live instance of that same
              pattern: the JARVIS gateway&apos;s authentication was found
              open again, on schedule, and fixed and re-verified the same
              day — because the check runs everywhere, every time, not
              because anyone remembered to look.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">
              Every automation here only proposes. None of them apply their own fixes.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Router-watch and security-watch both produce a dated report
              and stop. Nothing in either pipeline has write access to the
              router registry, the SSH config, or the firewall rules it
              reports on. Every finding is a proposal a human reads and
              applies by hand — the router-watch report&apos;s own footer
              says it plainly:
            </p>
            <pre className="p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed mb-4" style={{ background: "var(--bg-darker)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
{`This report is a PROPOSAL. No file was modified by this job.
To adopt a swap, hand-edit the router config, run the test suite,
and restart the gateway.`}
            </pre>
            <p className="text-sm text-slate-400 leading-relaxed">
              Security-watch works the same way: on the Aug 10 run, 8 of 10
              flagged findings were fixed — but each fix was a person
              reading the finding, applying the change by hand, and then
              running the same probe again to confirm it actually closed.
              The automation&apos;s only two states are &quot;here&apos;s
              what I found&quot; and &quot;here&apos;s what I re-verified after
              you fixed it&quot; — never &quot;here&apos;s what I changed for
              you.&quot;
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">
              POOL_WEIGHT: pricing budgets that aren&apos;t the same currency
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Our router spans a free local model, a Google-billed tier, an
              OpenRouter credit pool, and a flat-fee Claude subscription —
              four backends, three genuinely different kinds of money.
              Comparing them on raw dollars is meaningless: a $0 local call
              and a $0.03 OpenRouter call aren&apos;t equally &quot;free,&quot;
              and a Claude Max call that&apos;s already paid for by a flat
              subscription isn&apos;t the same kind of spend as metered
              OpenRouter credit. The registry prices every model in true
              dollars, then multiplies by a separate weight for selection
              only — real cost is never faked:
            </p>
            <pre className="p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed mb-4" style={{ background: "var(--bg-darker)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
{`POOL_WEIGHT = {
    "free": 0.0,          # local hardware; electricity only
    "google": 0.05,       # linked Google billing / free tier
    "openrouter": 1.0,    # real money out of the $30 / 30-day pool
    "claude_max": 1.0,    # flat subscription, but scarce + rate-limited
}`}
            </pre>
            <p className="text-sm text-slate-400 leading-relaxed">
              Selection compares <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>cost * POOL_WEIGHT</code>;
              budgets and logs always record true dollars, never the
              weighted number. An earlier version of this router faked the
              comparison a different way — repricing one backend to 5% of
              its list price to express &quot;this one&apos;s cheap to
              us&quot; — and that corrupted the registry&apos;s real prices,
              fought the price-refresh job, and silently flipped the tier
              ordering so a premium model auto-won by default. POOL_WEIGHT
              exists to keep that preference explicit and separate from the
              number everyone actually gets billed. The enterprise version
              of this is the same problem at a different scale: bundled SAP
              AI credits, a Databricks compute commitment, a Workday
              per-seat add-on, and direct API spend are not the same
              currency either, and &quot;which platform should run this
              workload&quot; stays an ungoverned default until something
              prices them on one basis.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">
              NEVER_COMPARE: the policy checks its own scope, every run
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              The router&apos;s premium, subscription-billed models
              (Claude Haiku, Sonnet, Opus, Fable) are marked
              <code className="text-xs px-1 py-0.5 rounded mx-1" style={{ background: "var(--bg-card)" }}>forced_only</code>
              in the registry — a stronger exclusion than &quot;expensive, so
              deprioritize it.&quot; The candidate filter that builds the
              auto-routing shortlist drops every forced_only model before
              cost is ever compared, at any complexity or value setting:
              they simply never enter the contest, and are reachable only
              by a deliberate, explicit call. Internally we call this
              discipline NEVER_COMPARE — the policy doesn&apos;t just rank
              those models last, it asserts they were never candidates at
              all, and the assertion is checked against the registry&apos;s
              live flags rather than assumed to still hold from when the
              code was written. The client-facing version of the same idea
              is discipline 3 in Standing Watch (Gate): the highest-blast-
              radius action category — payment release, master-data change,
              access grant — isn&apos;t &quot;requires approval,&quot; it&apos;s
              structurally invisible to the automation layer until a human
              invokes it on purpose. A guardrail that only ever
              deprioritizes a dangerous option is one bad default away from
              picking it; a guardrail that structurally excludes it can&apos;t
              drift there by accident.
            </p>
          </div>

          {/* Design decisions callout */}
          <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #EC6D3D08, #C8340608)", border: "1px solid #EC6D3D30" }}>
            <h2 className="text-lg font-bold text-white mb-3">
              What we deliberately didn&apos;t automate — and why that&apos;s the point
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              The human-apply step isn&apos;t a gap we haven&apos;t gotten to
              yet. It&apos;s the design. Router-watch could technically
              hand-edit the registry itself and restart the gateway;
              security-watch could technically flip the config flags it
              reports on. Neither does, on purpose, because the value of a
              propose-and-approve system is the durable record of a human
              decision attached to every change — a router swap or a
              hardening fix that an automation silently applied to itself
              would still be a change, but it would stop being evidence.
              The Aug 10 run makes the boundary concrete rather than
              theoretical: FileVault was left flagged, not fixed, because
              enabling disk encryption needs Recovery Mode / physical
              console access — nothing the automation runs with can reach
              that, so it says so instead of reaching for access it
              shouldn&apos;t have or silently skipping the finding. A
              separate item that same day — tightening the home
              router&apos;s own firewall rules — was flagged and correctly
              left alone for the identical reason: it needs the router&apos;s
              own admin UI, not anything scriptable from either machine.
              Knowing the edge of its own authority, and saying so, is part
              of the discipline, not a limitation of it.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>The scale caveat, stated plainly:</strong> this is
              real, running code — not slideware — but it&apos;s
              personal-scale infrastructure: one operator, two machines,
              five backends. It is not a Fortune 500 deployment, and we
              aren&apos;t claiming it is. What transfers to a client estate
              is the discipline (qualify, arbitrate, gate, probe, track,
              review) and the architecture (report + human-applies,
              modeled directly on router-watch and security-watch) — not a
              claim that we&apos;ve already run this at enterprise scale.
              We&apos;d rather volunteer that here than have a prospect find
              it out later.
            </p>
          </div>

          <BenchmarkCard
            data={{
              date: "2026-08-10",
              model: "No model call — real router-watch and security-watch excerpts",
              dataSource:
                "Real, dated excerpts from Tioga AI's own router-watch and security-watch automations, redacted for hostnames/IPs — not synthetic, not a demo dataset. See the full excerpts on the Standing Watch demo.",
              sampleSize: "Router-watch: 399 models screened, 0 cleared Stage 1. Security-watch: 65 findings across severities, 10 flagged for same-day action (9 in the report, plus one router-firewall item flagged the same day, outside either machine's reach).",
              metrics: [
                { label: "Security findings fixed & verified", value: "8 of 10 flagged (80%), same session" },
                { label: "Findings correctly left for a human", value: "2 of 10 (FileVault; home-router firewall — both outside automation's reach)" },
                { label: "Router-watch model catalog scanned", value: "399 models, 0 auto-applied swaps" },
                { label: "Automations with write access to live config", value: "0 — every change is human-applied" },
              ],
              limitations: [
                "This is Tioga's own internal infrastructure, personal-scale (one operator, two machines, five backends) — not a claim about enterprise-scale deployment.",
                "The catalog-scan and findings-fixed numbers are from one dated run (Aug 10, 2026), not an ongoing live counter — refreshed periodically, not real-time.",
                "Demonstrates the propose-and-approve pattern and its own honesty about scope, not a benchmark of model output quality — there's no task being graded here.",
              ],
            }}
          />
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/demos/standing-watch"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            See the real excerpts →
          </Link>
        </div>
      </section>
    </main>
  );
}
