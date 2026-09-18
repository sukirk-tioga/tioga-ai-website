import type { Metadata } from "next";
import Link from "next/link";
import DemoShell from "../_lib/demo-shell";
import { AGENTS, DISPOSITIONS, type DispositionEvent } from "../../../lib/agent-register";

export const metadata: Metadata = {
  title: "Automation Oversight — Tioga AI",
  description:
    "The real propose-and-approve discipline behind Tioga's own automation estate — what a daily review surfaced, what a human approved, and what happens when the estate catches its own mistakes.",
  alternates: { canonical: "/demos/automation-oversight" },
  openGraph: {
    title: "Automation Oversight — Tioga AI",
    description:
      "Real operational data, refreshed periodically — not a live-refreshing feed. Every finding is proposed; nothing is applied without a human review.",
  },
};

// Real excerpt from Tioga's own daily automation-review cycle, captured
// 2026-08-30. This page is the aggregate, ongoing counterpart to
// /demos/standing-watch's single detailed incident — see the cross-links
// below for how the three "real data from our own estate" demo pages
// divide the story. Data here is manually refreshed, same "not a
// live-refreshing feed" discipline as /demos/governance-ledger.

// Job count and disposition history now come from lib/agent-register.ts —
// the Reach Map scene's data module (app/demos/agent-reach-map/) — instead
// of a second, driftable copy of the same facts. That file's AGENTS array
// is the canonical 29-job list (sourced from `launchctl list`, laptop
// com.sukir.* plus the mini's com.tioga.*/com.jarvis.* entries) and
// DISPOSITIONS is the same 7 real, dated findings this page has always
// shown. See docs/design/3d-design-standard.md §6.4 ("data has exactly one
// source of truth") — re-verify AGENTS against `launchctl list` at the next
// real refresh, don't assume either file is still current on its own.
const SCHEDULED_AUTOMATIONS_COUNT = AGENTS.length;
const AUTOMATIONS_COUNT_AS_OF = "2026-09-10";

const RECENT: DispositionEvent[] = DISPOSITIONS;

export default function AutomationOversightPage() {
  return (
    <DemoShell
      title="Automation Oversight"
      badge="Real Operational Data — Refreshed Periodically"
      evidenceTier="internal-operational-excerpt"
      description="Every day, a background pass reviews Tioga's own automation estate for problems and improvements. Only a narrow, pre-approved class of change can apply itself; everything else waits for a human — this is that review, not a mockup of one."
    >
      <p className="text-xs mb-6 -mt-4" style={{ color: "var(--text-muted-3)" }}>
        As of Aug 30, 2026 — real operational data, refreshed periodically, not a live-refreshing feed.
      </p>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden mb-8" style={{ background: "var(--border)" }}>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>{SCHEDULED_AUTOMATIONS_COUNT}</div>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Scheduled automations</div>
          <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted-3)" }}>as of {AUTOMATIONS_COUNT_AS_OF}</div>
        </div>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>11</div>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Findings, last review</div>
        </div>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>10</div>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Required human review before applying</div>
        </div>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>1</div>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Auto-implemented under a pre-approved rule</div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-2" style={{ color: "var(--text)" }}>How this works</h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          A background pass reads the estate&apos;s own logs and cost data daily and drafts findings —
          bugs, cost drift, hardening gaps. It never applies anything on its own authority. A small,
          hard-coded set of change types (a pure addition, syntax-checked afterward) may be applied
          automatically; everything else is proposed and sits until a human reviews it. There is no
          path from a finding to a live change that skips that review.
        </p>
      </div>

      {/* Recent dispositions */}
      <div className="rounded-2xl overflow-hidden mb-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="px-5 pt-5 pb-3">
          <h2 className="font-semibold" style={{ color: "var(--text)" }}>Recent dispositions</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            What the review found and what happened to it. Nothing here was written for this page.
          </p>
        </div>
        <div>
          {RECENT.map((r, i) => (
            <div
              key={i}
              className="px-5 py-4"
              style={{
                borderTop: "1px solid var(--border)",
                borderBottom: i === RECENT.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-1.5">
                <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap pt-0.5">{r.date}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={
                    r.disposition === "approved"
                      ? { background: "#4ADE8015", border: "1px solid #4ADE8040", color: "var(--success)" }
                      : { background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }
                  }
                >
                  {r.disposition === "approved" ? "human-approved" : "auto-implemented, bounded"}
                </span>
              </div>
              <p className="text-sm text-[var(--text)] leading-snug mb-1">{r.finding}</p>
              <p className="text-[11px] text-slate-500">{r.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Honesty note — the estate catching its own mistakes */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold mb-2" style={{ color: "var(--text)" }}>Including when the estate is wrong</h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          The Aug 29 entry above isn&apos;t a hardening find against a third party — it&apos;s Tioga&apos;s own
          pre-deploy safety gate incorrectly flagging its own working code as broken, every morning,
          until the review caught why. A review process that only ever finds things elsewhere isn&apos;t
          being run against itself. This one is.
        </p>
      </div>

      {/* Cross-links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/demos/standing-watch"
          className="group p-5 rounded-2xl transition-all hover:border-slate-500"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-1 group-hover:opacity-80" style={{ color: "var(--text)" }}>One incident, in full detail →</p>
          <p className="text-xs text-[var(--text-muted)]">
            Standing Watch walks a single real security finding end to end — what was found, what was
            fixed, what still needed a human.
          </p>
        </Link>
        <Link
          href="/demos/governance-ledger"
          className="group p-5 rounded-2xl transition-all hover:border-slate-500"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-1 group-hover:opacity-80" style={{ color: "var(--text)" }}>Spend-level detail →</p>
          <p className="text-xs text-[var(--text-muted)]">
            The Governance Ledger shows every individual AI model call — cost, tokens, and routing
            decision, row by row.
          </p>
        </Link>
      </div>
    </DemoShell>
  );
}
