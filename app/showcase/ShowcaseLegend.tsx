import {
  TOTAL_CALLS,
  FREE_COUNT,
  PAID_COUNT,
  FREE_ZERO_COST_COUNT,
  FREE_ZERO_COST_PCT,
  TOTAL_SPEND,
  BUDGET_CAP,
  BACKEND_ROUTES,
} from "../../lib/governance-ledger";

// All labels live in the DOM, not in the canvas (plan §3 non-goal: no
// drei/Text) — this is the legend for the scene above it. Every number
// here reads from lib/governance-ledger.ts's derived exports, so it can't
// drift from the rows the scene is actually animating.
//
// 2026-08-15 (round 3): rewritten for the Gateway Corridor rebuild —
// tiles -> gate -> pools, replacing the old three-plane-stack language.
// The gate story changed too: every ribbon (all 17, not just paid ones)
// converges through the same gate point now — a more honest picture of
// "every call passes through governance" than the old design's free-pool
// "bypass in a side lane," which implied free-tier calls skip the check
// entirely. They don't; they're checked and settle at $0.
export default function ShowcaseLegend() {
  return (
    <div className="grid sm:grid-cols-3 gap-3 mt-4">
      <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: "var(--accent)" }}>
          The ledger field
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          {TOTAL_CALLS} real rows, rasterized into a GPU particle field — the same table as{" "}
          <span className="font-mono">/demos/governance-ledger</span>, made of light instead of
          HTML. Ribbon width is each row&apos;s real token count — wider ribbons carried more
          tokens, not a decoration. Press Replay to watch each row&apos;s own particles detach and
          travel the real, compressed Jul 17–25 timeline.
        </p>
      </div>
      <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: "var(--accent)" }}>
          The gate
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Every ribbon passes through the same checkpoint — the budget reservation against the
          real ${BUDGET_CAP.toFixed(2)} / 30-day cap. Spend sits at ${TOTAL_SPEND.toFixed(6)}.{" "}
          {FREE_COUNT} of {TOTAL_CALLS} calls are free-pool; {FREE_ZERO_COST_COUNT} of those (
          {FREE_ZERO_COST_PCT}%) settle at exactly $0. {PAID_COUNT} paid calls don&apos;t. Real
          glass (refraction, not a flat glow) — the ribbons visibly bend passing through it.
        </p>
      </div>
      <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: "var(--accent)" }}>
          Pool terminals
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          {BACKEND_ROUTES.length} backend pools light up as calls arrive — requested→served is
          real: e.g. <span className="font-mono">glm-flash</span> served by{" "}
          <span className="font-mono">qwen/qwen3-8b</span>.
        </p>
      </div>

      <div
        className="sm:col-span-3 p-4 rounded-xl flex flex-wrap gap-x-6 gap-y-2 items-center"
        style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
      >
        <LegendSwatch color="var(--accent)" label="Free-pool call" />
        <LegendSwatch color="var(--accent-dark)" label="Paid call" />
        <LegendSwatch color="var(--success)" label="Crossing the gate" />
        <span className="text-xs text-[var(--text-muted)] ml-auto">
          NIST AI RMF: <NistChip label="MAP" color="var(--accent)" /> <NistChip label="MEASURE" color="var(--violet)" />{" "}
          <NistChip label="MANAGE" color="var(--blue)" /> <NistChip label="GOVERN (the gate)" color="var(--accent-dark)" />
        </span>
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function NistChip({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ border: "1px solid var(--border)", color }}>
      {label}
    </span>
  );
}
