import type { CSSProperties } from "react";
import { AGENTS, SYSTEMS, type SystemId, type Tier } from "../../../lib/agent-register";

// Deterministic fallback — no WebGL, prefers-reduced-motion, or a lost
// WebGL context all land here. Same 29-row register as the 3D scene and
// /demos/automation-oversight, rendered as a real HTML table (not a blank
// canvas, not a static image standing in for the data). First-class
// deliverable per docs/design/3d-design-standard.md §5.3, and honestly the
// closer shape to what the actual sales deliverable looks like — a table.
const TIER_LABEL: Record<Tier, string> = {
  "agent-owned": "agent-owned",
  "human-supervised": "human-supervised",
  "human-owned": "human-owned",
};

// 8-digit alpha-suffixed hex tints, matching the CLAUDE.md-documented
// exception (var() can't be alpha-suffixed inline) and the real hex value
// of each token they tint (--accent #C83406, --warning #A8681E) — same
// pattern already used in ShowcaseFallback.tsx and DemoShell.tsx.
const TIER_STYLE: Record<Tier, CSSProperties> = {
  "agent-owned": { background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent-on-tint)" },
  "human-supervised": { background: "#A8681E15", border: "1px solid #A8681E30", color: "var(--warning)" },
  "human-owned": { background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-muted)" },
};

function systemName(id: SystemId): string {
  return SYSTEMS.find((s) => s.id === id)?.name ?? id;
}

export default function Fallback() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      data-testid="agent-reach-map-fallback-table"
    >
      <div className="px-5 pt-5 pb-3">
        <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          Agent authorization register (table view)
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Your browser or system settings turned off the 3D scene (no WebGL, reduced motion, or a
          lost graphics context) — here are the same {AGENTS.length} scheduled agents without it.
        </p>
      </div>
      <div role="region" aria-label="Table: scheduled agents" tabIndex={0} className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 800 }}>
          <thead>
            <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              {["Agent", "Schedule", "Reads", "Writes (tier)", "Blast radius"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-medium px-4 py-2.5 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AGENTS.map((agent, i) => (
              <tr key={agent.id} style={{ borderBottom: i === AGENTS.length - 1 ? "none" : "1px solid var(--border)" }}>
                <td className="px-4 py-2.5 align-top" style={{ minWidth: 200 }}>
                  <div className="font-medium" style={{ color: "var(--text)" }}>
                    {agent.name}
                  </div>
                  <div className="text-[11px] text-slate-500">{agent.purpose}</div>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap align-top">
                  {agent.schedule}
                </td>
                <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] align-top" style={{ minWidth: 160 }}>
                  {agent.reads.length === 0 ? (
                    <span className="text-slate-500">—</span>
                  ) : (
                    agent.reads.map(systemName).join(", ")
                  )}
                </td>
                <td className="px-4 py-2.5 align-top" style={{ minWidth: 220 }}>
                  {agent.writes.length === 0 ? (
                    <span className="text-[11px] text-slate-500">advisory only — no writes</span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {agent.writes.map((w, wi) => (
                        <div key={wi} className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs" style={{ color: "var(--text)" }}>
                            {systemName(w.system)}
                          </span>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                            style={TIER_STYLE[w.tier]}
                          >
                            {TIER_LABEL[w.tier]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] align-top" style={{ minWidth: 220 }}>
                  {agent.blastRadius}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
