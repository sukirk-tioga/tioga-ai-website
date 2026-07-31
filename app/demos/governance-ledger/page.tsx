import type { Metadata } from "next";
import DemoShell from "../_lib/demo-shell";

export const metadata: Metadata = {
  title: "Governance Ledger Demo — Tioga AI",
  description:
    "A real excerpt from Tioga AI's own AI routing gateway ledger — every model call logged, costed, budget-capped, and mapped to the NIST AI RMF.",
  openGraph: {
    title: "Governance Ledger Demo — Tioga AI",
    description:
      "Live operational data — not a simulation. Every AI call logged, costed, and mapped to the NIST AI RMF.",
  },
};

// Real excerpt from Tioga's own AI routing gateway ledger (JARVIS), captured
// 2026-07-26. Not synthetic — this is what the governed-write-path and
// insurance-readiness offers are built on: every model call logged, costed,
// budget-capped, and attributed as a byproduct of routing, not bolted on.

interface LedgerRow {
  ts: string;
  requested: string;
  served: string;
  in: number;
  out: number;
  cost: string;
  pool: "free" | "paid";
  quality?: string;
  tags: Array<"MAP" | "MEASURE" | "MANAGE">;
}

const LEDGER: LedgerRow[] = [
  { ts: "Jul 17 16:54:27", requested: "gemini-flash", served: "gemini-3-flash-preview", in: 29, out: 6, cost: "$0.000002", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 16:54:37", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 43, out: 150, cost: "$0.000490", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Jul 17 17:20:09", requested: "glm-flash", served: "qwen/qwen3-8b", in: 14, out: 30, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:20:46", requested: "glm-flash", served: "qwen/qwen3-8b", in: 14, out: 400, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:20:49", requested: "gemini-flash", served: "gemini-3-flash-preview", in: 8, out: 20, cost: "$0.000003", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:21:18", requested: "glm-flash", served: "qwen/qwen3-8b", in: 14, out: 400, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:21:20", requested: "gemini-flash", served: "gemini-3-flash-preview", in: 8, out: 20, cost: "$0.000003", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:21:45", requested: "glm-flash", served: "qwen/qwen3-8b", in: 18, out: 13, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:21:48", requested: "gemini-flash", served: "gemini-3-flash-preview", in: 8, out: 1, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 17 17:21:52", requested: "glm-5.2", served: "z-ai/glm-5.2", in: 19, out: 79, cost: "$0.000255", pool: "paid", tags: ["MAP", "MANAGE"] },
  { ts: "Jul 17 17:54:32", requested: "glm-flash", served: "qwen/qwen3-8b", in: 17, out: 12, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 22 22:39:58", requested: "glm-flash", served: "qwen/qwen3-8b", in: 19, out: 6, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 24 12:57:27", requested: "glm-flash", served: "qwen/qwen3-8b", in: 21, out: 7, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 25 11:15:59", requested: "glm-flash", served: "qwen/qwen3-8b", in: 17, out: 12, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 25 14:07:30", requested: "glm-flash", served: "qwen/qwen3-8b", in: 18, out: 7, cost: "$0.000000", pool: "free", quality: "0.90", tags: ["MAP", "MEASURE"] },
  { ts: "Jul 25 15:14:39", requested: "glm-flash", served: "qwen/qwen3-8b", in: 19, out: 8, cost: "$0.000000", pool: "free", tags: ["MAP"] },
  { ts: "Jul 25 15:34:07", requested: "glm-flash", served: "qwen/qwen3-8b", in: 19, out: 6, cost: "$0.000000", pool: "free", tags: ["MAP"] },
];

const STATS = [
  { label: "Spend vs. cap", value: "$0.000958", sub: "of $30.00 · 30-day rolling window" },
  { label: "Calls logged", value: "17", sub: "unsampled — every call, not a spot check" },
  { label: "Backends in rotation", value: "3", sub: "local free-tier → Google → OpenRouter, by policy" },
  { label: "Paid vs. free-tier", value: "2 / 17", sub: "88% of calls settled at $0 before touching billed credit" },
];

// Pulled live from the gateway's own status tool on Jul 27, 2026 — a
// separate check from the ledger rows above (captured Jul 17-25). Refreshed
// manually when this page is updated, not a real-time ticker.
const LIVE_STATS = [
  { label: "Monthly budget cap", value: "$30.00", sub: "hard ceiling, shared across every machine running this infrastructure" },
  { label: "Spent this window", value: "$0.0007", sub: "0.002% of cap — window opened Jul 17, 2026" },
  { label: "Per-request ceiling", value: "$1.00", sub: "reserved and checked before any single call goes out" },
  { label: "Backend health", value: "3 / 3", sub: "local T0, Google, and OpenRouter all reachable at last check" },
];

const FUNCTIONS = [
  {
    name: "GOVERN",
    body: "A spend policy — $30 per 30-day window, shared across every machine running this infrastructure — set once and enforced automatically on every call.",
    field: "policy: budget.json",
  },
  {
    name: "MAP",
    body: "Every call records what was requested and what actually served it. No AI action happens without a named model and a named route.",
    field: "field: model → served_model",
  },
  {
    name: "MEASURE",
    body: "Token volume and cost are recorded on every call; response quality is scored and attached where evaluated.",
    field: "field: in / out / cost / quality",
  },
  {
    name: "MANAGE",
    body: "Spend against paid credit is checked and reserved before the call goes out — the system can't overspend the cap, because it never sends a request that would.",
    field: "function: budget reserve-and-charge",
  },
];

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
      badge="Live Operational Data — Not a Simulation"
      description="Every model call our own AI infrastructure makes is logged, costed, budget-capped, and attributed — automatically, as a byproduct of how it routes work. This is a real excerpt from that ledger."
    >
      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATS.map((s) => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5">{s.label}</p>
            <p className="text-xl font-bold text-white font-mono">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1 leading-snug">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Ledger table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="px-5 pt-5 pb-3">
          <h2 className="font-semibold text-white">Per-call ledger</h2>
          <p className="text-xs text-slate-500 mt-1">
            What was requested, what actually served it, what it cost, and which governance
            function it evidences. Nothing here was written for this page.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                {["Timestamp", "Requested → served", "Tokens in/out", "Cost", "Pool", "Quality", "Evidences"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-slate-500 uppercase tracking-wide font-medium px-4 py-2.5 whitespace-nowrap">
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
                    <span className="text-slate-500">{row.requested}</span>
                    <span className="mx-1.5 text-slate-600">→</span>
                    <span className="text-white font-medium">{row.served}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-300 whitespace-nowrap">{row.in} / {row.out}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-300 whitespace-nowrap">{row.cost}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={poolStyle[row.pool]}>
                      {row.pool === "free" ? "free-tier" : "OpenRouter"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500 whitespace-nowrap">{row.quality ?? "—"}</td>
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

      {/* Live gateway snapshot */}
      <div className="mt-8">
        <h2 className="font-semibold text-white mb-1">Live gateway snapshot</h2>
        <p className="text-xs text-slate-500 mb-4">
          Checked directly against the gateway&apos;s own status tool on Jul 27,
          2026 — a separate, fresher check than the ledger rows above, not a
          live-refreshing counter on this page.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LIVE_STATS.map((s) => (
            <div key={s.label} className="p-4 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
              <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5">{s.label}</p>
              <p className="text-xl font-bold text-white font-mono">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* NIST AI RMF mapping */}
      <div className="mt-8">
        <h2 className="font-semibold text-white mb-1">What this satisfies</h2>
        <p className="text-xs text-slate-500 mb-4">
          Mapped to the NIST AI RMF&apos;s four functions — the framework this ledger was built against, not retrofitted to.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {FUNCTIONS.map((f) => (
            <div key={f.name} className="p-4 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold tracking-wide mb-1.5" style={{ color: "var(--accent)" }}>{f.name}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
              <p className="text-[11px] font-mono text-slate-600 mt-2">{f.field}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Offer tie-in */}
      <div className="mt-6 p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-sm text-slate-300 leading-relaxed">
          This is the pattern we build into client systems: every AI action logged, budgeted,
          and attributable — applied to a governed write-path into your ERP, or packaged as
          evidence for an insurance renewal, instead of a general-purpose AI gateway.
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
