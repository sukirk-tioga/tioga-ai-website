import { LEDGER } from "../../lib/governance-ledger";

// Deterministic fallback — no WebGL, prefers-reduced-motion, or a lost
// WebGL context all land here. Same 17 rows as the 3D scene and the
// /demos/governance-ledger table, rendered as a real HTML table (not a
// blank canvas, not a static image standing in for the data). This path
// is a first-class deliverable per the plan §3, not an afterthought.
const poolStyle = {
  free: { background: "#4ADE8015", border: "1px solid #4ADE8040", color: "var(--success)" },
  paid: { background: "#FBBF2415", border: "1px solid #FBBF2440", color: "var(--warning-light)" },
} as const;

export default function ShowcaseFallback() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      data-testid="showcase-fallback-table"
    >
      <div className="px-5 pt-5 pb-3">
        <h2 className="font-semibold text-white text-sm">Per-call ledger (table view)</h2>
        <p className="text-xs text-slate-400 mt-1">
          Your browser or system settings turned off the 3D scene (no WebGL, reduced motion, or a
          lost graphics context) — here are the same 17 rows without it.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 640 }}>
          <thead>
            <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              {["Timestamp", "Requested → served", "Tokens in/out", "Cost", "Pool"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] text-slate-400 uppercase tracking-wide font-medium px-4 py-2.5 whitespace-nowrap"
                >
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
                <td className="px-4 py-2.5 font-mono text-xs text-slate-300 whitespace-nowrap">
                  {row.in} / {row.out}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-300 whitespace-nowrap">{row.cost}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={poolStyle[row.pool]}>
                    {row.pool === "free" ? "free-tier" : "OpenRouter"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
