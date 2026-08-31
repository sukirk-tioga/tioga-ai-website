import type { Metadata } from "next";
import Link from "next/link";
import DemoShell from "../_lib/demo-shell";

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

interface Disposition {
  date: string;
  finding: string;
  category: string;
  disposition: "approved" | "auto-implemented";
}

const RECENT: Disposition[] = [
  {
    date: "2026-08-30",
    finding: "A verified market-development note was created — a pure addition, syntax-checked, matching the narrow rule that's allowed to apply itself without waiting on review.",
    category: "Tioga AI Business",
    disposition: "auto-implemented",
  },
  {
    date: "2026-08-30",
    finding: "The one script in the estate that writes files had no per-run spend cap — every sibling script had one.",
    category: "AI OS Hardening",
    disposition: "approved",
  },
  {
    date: "2026-08-30",
    finding: "A source feed with a genuinely quiet publishing cadence was being reported as \"unreachable\" every time it had nothing new — a false alarm on a feed working exactly as designed.",
    category: "AI OS Hardening",
    disposition: "approved",
  },
  {
    date: "2026-08-30",
    finding: "A deterministic pre-flight check existed but was never wired into the daily pipeline it was built for.",
    category: "AI OS Hardening",
    disposition: "approved",
  },
  {
    date: "2026-08-30",
    finding: "A model-routing environment variable was left as an unpinned alias in the one script that edits production files, risking a silent model swap with no diff or approval.",
    category: "Model routing",
    disposition: "approved",
  },
  {
    date: "2026-08-30",
    finding: "A background cost-tracking pass had grown noticeably more expensive over several days for no clear reason — flagged for measurement, not yet root-caused.",
    category: "Token/cost optimization",
    disposition: "approved",
  },
  {
    date: "2026-08-29",
    finding: "A pre-deploy safety gate was flagging a real, working script as a syntax error every single morning — a false positive traced to the gate checking the wrong shell dialect.",
    category: "AI OS Hardening",
    disposition: "approved",
  },
];

export default function AutomationOversightPage() {
  return (
    <DemoShell
      title="Automation Oversight"
      badge="Real Operational Data — Refreshed Periodically"
      description="Every day, a background pass reviews Tioga's own automation estate for problems and improvements. Only a narrow, pre-approved class of change can apply itself; everything else waits for a human — this is that review, not a mockup of one."
    >
      <p className="text-xs mb-6 -mt-4" style={{ color: "var(--text-muted-3)" }}>
        As of Aug 30, 2026 — real operational data, refreshed periodically, not a live-refreshing feed.
      </p>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden mb-8" style={{ background: "var(--border)" }}>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>28</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Scheduled automations</div>
        </div>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>11</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Findings, last review</div>
        </div>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>10</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Required human review before applying</div>
        </div>
        <div className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
          <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>1</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Auto-implemented under a pre-approved rule</div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-white mb-2">How this works</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
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
          <h2 className="font-semibold text-white">Recent dispositions</h2>
          <p className="text-xs text-slate-400 mt-1">
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
                      : { background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }
                  }
                >
                  {r.disposition === "approved" ? "human-approved" : "auto-implemented, bounded"}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-snug mb-1">{r.finding}</p>
              <p className="text-[11px] text-slate-500">{r.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Honesty note — the estate catching its own mistakes */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-white mb-2">Including when the estate is wrong</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
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
          <p className="text-sm font-semibold text-white mb-1 group-hover:opacity-80">One incident, in full detail →</p>
          <p className="text-xs text-slate-400">
            Standing Watch walks a single real security finding end to end — what was found, what was
            fixed, what still needed a human.
          </p>
        </Link>
        <Link
          href="/demos/governance-ledger"
          className="group p-5 rounded-2xl transition-all hover:border-slate-500"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold text-white mb-1 group-hover:opacity-80">Spend-level detail →</p>
          <p className="text-xs text-slate-400">
            The Governance Ledger shows every individual AI model call — cost, tokens, and routing
            decision, row by row.
          </p>
        </Link>
      </div>
    </DemoShell>
  );
}
