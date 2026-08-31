import type { Metadata } from "next";
import Link from "next/link";
import DemoShell from "../_lib/demo-shell";
import { LEDGER, STATS, LIVE_STATS, FUNCTIONS } from "../../../lib/governance-ledger";

export const metadata: Metadata = {
  title: "Governance Ledger Demo — Tioga AI",
  description:
    "A real excerpt from Tioga AI's own AI routing gateway ledger — every model call logged, costed, budget-capped, and mapped to the NIST AI RMF.",
  alternates: { canonical: "/demos/governance-ledger" },
  openGraph: {
    title: "Governance Ledger Demo — Tioga AI",
    description:
      "Real operational data, refreshed periodically — not a live-refreshing feed. Every AI call logged, costed, and mapped to the NIST AI RMF.",
  },
};

// Real excerpt from Tioga's own AI routing gateway ledger (JARVIS), captured
// 2026-07-26. Not synthetic — this is what the governed-write-path and
// insurance-readiness offers are built on: every model call logged, costed,
// budget-capped, and attributed as a byproduct of routing, not bolted on.
//
// Data lives in lib/governance-ledger.ts, shared with the /showcase 3D
// scene, so the two views can never drift from each other.

const poolStyle = {
  free: { background: "#4ADE8015", border: "1px solid #4ADE8040", color: "var(--success)" },
  paid: { background: "#FBBF2415", border: "1px solid #FBBF2440", color: "var(--warning-light)" },
} as const;

const tagStyle: Record<string, { color: string }> = {
  MAP: { color: "var(--accent)" },
  MEASURE: { color: "var(--text)" },
  MANAGE: { color: "var(--warning-light)" },
};

export default function GovernanceLedgerPage() {
  return (
    <DemoShell
      title="Governance Ledger"
      badge="Real Operational Data — Refreshed Periodically"
      description="Every model call our own AI infrastructure makes is logged, costed, budget-capped, and attributed — automatically, as a byproduct of how it routes work. This is a real excerpt from that ledger."
    >
      <p className="text-xs mb-6 -mt-4" style={{ color: "var(--text-muted-3)" }}>
        Last updated: Jul 27, 2026 — real operational data, refreshed periodically, not a live-refreshing feed.
      </p>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATS.map((s) => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1.5">{s.label}</p>
            <p className="text-xl font-bold text-white font-mono">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1 leading-snug">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Ledger table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="px-5 pt-5 pb-3">
          <h2 className="font-semibold text-white">Per-call ledger</h2>
          <p className="text-xs text-slate-400 mt-1">
            What was requested, what actually served it, what it cost, and which governance
            function it evidences. Nothing here was written for this page.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                {["Timestamp", "Requested → served", "Tokens in/out", "Cost", "Pool", "Quality", "Evidences"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-slate-400 uppercase tracking-wide font-medium px-4 py-2.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEDGER.map((row, i) => (
                <tr key={i} style={{ borderBottom: i === LEDGER.length - 1 ? "none" : "1px solid var(--border)" }}>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400 whitespace-nowrap">{row.ts}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="text-slate-400">{row.requested}</span>
                    <span className="mx-1.5 text-slate-400">→</span>
                    <span className="text-white font-medium">{row.served}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-300 whitespace-nowrap">{row.in} / {row.out}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-300 whitespace-nowrap">{row.cost}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={poolStyle[row.pool]}>
                      {row.pool === "free" ? "free-tier" : "OpenRouter"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400 whitespace-nowrap">{row.quality ?? "—"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex gap-1.5">
                      {row.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded"
                          style={{ border: "1px solid var(--border)", ...tagStyle[t] }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gateway snapshot */}
      <div className="mt-8">
        <h2 className="font-semibold text-white mb-1">Gateway snapshot</h2>
        <p className="text-xs text-slate-400 mb-4">
          Checked directly against the gateway&apos;s own status tool on Jul 27,
          2026 — a separate, fresher check than the ledger rows above, not a
          live-refreshing counter on this page.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LIVE_STATS.map((s) => (
            <div key={s.label} className="p-4 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1.5">{s.label}</p>
              <p className="text-xl font-bold text-white font-mono">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* NIST AI RMF mapping */}
      <div className="mt-8">
        <h2 className="font-semibold text-white mb-1">What this satisfies</h2>
        <p className="text-xs text-slate-400 mb-4">
          Mapped to the NIST AI RMF&apos;s four functions — the framework this ledger was built against, not retrofitted to.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {FUNCTIONS.map((f) => (
            <div key={f.name} className="p-4 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold tracking-wide mb-1.5" style={{ color: "var(--accent)" }}>{f.name}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-2">{f.field}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Showcase tie-in */}
      <div className="mt-8 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div>
          <p className="text-sm font-semibold text-white mb-1">Same 17 rows, as an interactive 3D scene</p>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            The Gateway Corridor renders this exact ledger as a scene every call passes through —
            one governed checkpoint, three real backend destinations.
          </p>
        </div>
        <Link
          href="/showcase"
          className="shrink-0 text-xs font-mono px-3 py-1.5 rounded-full transition-colors hover:border-slate-500"
          style={{ color: "var(--accent)", background: "#00D4FF15", border: "1px solid #00D4FF30" }}
        >
          View the scene →
        </Link>
      </div>

      {/* Offer tie-in */}
      <div className="mt-6 p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-sm text-slate-300 leading-relaxed">
          This is the pattern we build into client systems: every AI action logged, budgeted,
          and attributable — applied to a governed write-path into your ERP, or packaged as
          evidence for an insurance renewal, instead of a general-purpose AI gateway.
        </p>
        <p className="text-xs text-slate-500 mt-3">
          This is spend-level detail. For how findings across the whole automation estate get
          reviewed and approved, see{" "}
          <Link href="/demos/automation-oversight" className="hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
            Automation Oversight →
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            "Agent-Ready ERP Diagnostic & Governed Write-Path — $60–120K",
            "AI Governance Evidence Package for Insurance Underwriting — $15–25K",
            "AI Cost & Model Governance Assessment — $10–20K",
          ].map((o) => (
            <a
              key={o}
              href="/services"
              className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:border-slate-500"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              {o}
            </a>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
