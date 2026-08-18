"use client";

import { useEffect, useState } from "react";
import { LEDGER } from "@/lib/governance-ledger";

// A compact preview of the real Governance Ledger (see
// /demos/governance-ledger and lib/governance-ledger.ts — same array,
// imported, not re-typed, so this can't drift from the real data, and
// shared with the /showcase 3D scene too). Rows reveal on mount the same
// way HeroDemo's fields do, purely as
// a read pace, not a simulated live tick — the badge and caption say so
// explicitly, matching this site's existing "refreshed periodically, not
// live-refreshing" convention on the full ledger page and homepage callout.

const PREVIEW_ROWS = LEDGER.slice(-4);
const ROW_STEP_MS = 220;

const poolStyle = {
  free: { background: "#4ADE8015", border: "1px solid #4ADE8040", color: "var(--success)" },
  paid: { background: "#FBBF2415", border: "1px solid #FBBF2440", color: "var(--warning-light)" },
} as const;

export default function GovernanceLedgerPreview() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [revealCount, setRevealCount] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    if (revealCount >= PREVIEW_ROWS.length) return;
    const t = setTimeout(() => setRevealCount((c) => c + 1), ROW_STEP_MS);
    return () => clearTimeout(t);
  }, [revealCount, reducedMotion]);

  const effectiveRevealCount = reducedMotion ? PREVIEW_ROWS.length : revealCount;

  return (
    <div className="rounded-2xl overflow-hidden text-left" style={{ background: "var(--bg-darker)", border: "1px solid var(--border)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="text-xs font-mono" style={{ color: "var(--text-muted-2)" }}>Governance Ledger</span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono"
          style={{ background: "#00D4FF10", color: "var(--accent)", border: "1px solid #00D4FF25" }}
        >
          real excerpt · not live
        </span>
      </div>

      <div className="p-4 space-y-1.5" style={{ minHeight: "148px" }}>
        {PREVIEW_ROWS.slice(0, effectiveRevealCount).map((row) => (
          <div key={row.ts} className="flex items-center justify-between text-xs gap-3 font-mono field-fade-in">
            <span style={{ color: "var(--text-muted-2)" }}>{row.ts}</span>
            <span className="flex-1 min-w-0 truncate" style={{ color: "var(--text)" }}>
              {row.requested}
              <span style={{ color: "var(--text-muted-2)" }}> {"→"} </span>
              {row.served}
            </span>
            <span
              className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full"
              style={poolStyle[row.pool]}
            >
              {row.pool === "free" ? "free-tier" : "OpenRouter"}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 text-[11px]" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted-3)" }}>
        Real operational data, refreshed periodically — not a live-refreshing feed.
      </div>
    </div>
  );
}
