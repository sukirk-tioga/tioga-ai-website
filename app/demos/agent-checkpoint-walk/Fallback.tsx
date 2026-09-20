import type { CSSProperties } from "react";
import { AGENTS, type Tier } from "../../../lib/agent-register";
import { systemRow } from "./checkpointLayout";

// Deterministic fallback — no WebGL, prefers-reduced-motion, or a lost
// WebGL context all land here. Same real register as the interactive
// scene, rendered as a real HTML table, one row per real write edge (the
// same rows the interactive scene lets you walk) plus one row for every
// agent with no writes at all, so all 29 real agents stay represented —
// same discipline as agent-reach-map/Fallback.tsx.
const TIER_LABEL: Record<Tier, string> = {
  "agent-owned": "agent-owned",
  "human-supervised": "human-supervised",
  "human-owned": "human-owned",
};

// 8-digit alpha-suffixed hex tints, matching the CLAUDE.md-documented
// exception (var() can't be alpha-suffixed inline) and the real hex value
// of each token they tint (--accent #C83406, --warning #A8681E) — same
// pattern already used in agent-reach-map/Fallback.tsx.
const TIER_STYLE: Record<Tier, CSSProperties> = {
  "agent-owned": { background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent-on-tint)" },
  "human-supervised": { background: "#A8681E15", border: "1px solid #A8681E30", color: "var(--warning)" },
  "human-owned": { background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-muted)" },
};

interface FallbackRow {
  agentId: string;
  agentName: string;
  schedule: string;
  system: string | null;
  tier: Tier | null;
  approver: string | null;
  note: string;
}

function buildRows(): FallbackRow[] {
  const rows: FallbackRow[] = [];
  AGENTS.forEach((agent) => {
    if (agent.writes.length === 0) {
      rows.push({
        agentId: agent.id,
        agentName: agent.name,
        schedule: agent.schedule,
        system: null,
        tier: null,
        approver: null,
        note: "Advisory only — no write edges in the register.",
      });
      return;
    }
    agent.writes.forEach((write) => {
      rows.push({
        agentId: agent.id,
        agentName: agent.name,
        schedule: agent.schedule,
        system: systemRow(write.system).name,
        tier: write.tier,
        approver: write.approver ?? null,
        note: write.note,
      });
    });
  });
  return rows;
}

export default function Fallback() {
  const rows = buildRows();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      data-testid="agent-checkpoint-walk-fallback-table"
    >
      <div className="px-5 pt-5 pb-3">
        <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          Checkpoint register (table view)
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Your browser or system settings turned off the 3D scene (no WebGL, reduced motion, or a lost graphics
          context) — here is every real write edge across all {AGENTS.length} scheduled agents without it: the same
          rows the interactive scene lets you walk.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 800 }}>
          <thead>
            <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              {["Agent", "Write target", "Tier", "Approver", "Note"].map((h) => (
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
            {rows.map((row, i) => (
              <tr
                key={`${row.agentId}-${i}`}
                style={{ borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--border)" }}
              >
                <td className="px-4 py-2.5 align-top" style={{ minWidth: 180 }}>
                  <div className="font-medium" style={{ color: "var(--text)" }}>
                    {row.agentName}
                  </div>
                  <div className="text-[11px] text-slate-500">{row.schedule}</div>
                </td>
                <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] align-top" style={{ minWidth: 160 }}>
                  {row.system ?? <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-2.5 align-top" style={{ minWidth: 160 }}>
                  {row.tier ? (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                      style={TIER_STYLE[row.tier]}
                    >
                      {TIER_LABEL[row.tier]}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">no write</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] align-top" style={{ minWidth: 160 }}>
                  {row.approver ?? <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] align-top" style={{ minWidth: 260 }}>
                  {row.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
