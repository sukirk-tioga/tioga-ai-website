// Four-way evidence-type label, applied consistently across every demo page
// via DemoShell. Added per the 2026-09-06/07 Astra + Fable adversarial
// launch-readiness reviews (both models independently flagged that the site's
// demos didn't distinguish a synthetic browser toy from a real model call from
// dated internal operational evidence from a named ERP sandbox) — see
// ~/SecondBrain/TiogaAI/strategy/2026-09-07-astra-vs-fable-launch-review-comparison.md.
//
// This is a classification of *evidence type*, independent of each demo's
// existing `badge` prop (which is free-text framing/title copy) — a demo can
// keep its own badge wording and still carry one of these four tags.
export type EvidenceTier =
  | "browser-simulation"
  | "model-demonstration"
  | "internal-operational-excerpt"
  | "erp-sandbox-demonstration";

export const EVIDENCE_TIERS: Record<EvidenceTier, { label: string; detail: string }> = {
  "browser-simulation": {
    label: "Browser simulation",
    detail: "Synthetic records, local state — no live ERP connection.",
  },
  "model-demonstration": {
    label: "Model demonstration",
    detail: "A real model processes a real sample you provide; downstream handling is disclosed below.",
  },
  "internal-operational-excerpt": {
    label: "Internal operational excerpt",
    detail: "Dated evidence from Tioga's own infrastructure, workload scale noted.",
  },
  "erp-sandbox-demonstration": {
    label: "ERP sandbox demonstration",
    detail: "A named release/interface, with actual transaction and audit identifiers.",
  },
};

// `detail` lets a page override the generic one-line description with a more
// precise, still-honest sentence for that specific demo (e.g. the Marble
// audit is dated internal evidence but against a third-party API, not
// Tioga's own infrastructure — see that page's usage).
export function EvidenceTierTag({ tier, detail }: { tier: EvidenceTier; detail?: string }) {
  const info = EVIDENCE_TIERS[tier];
  return (
    <div
      className="inline-flex flex-col gap-0.5 mb-6 px-3 py-2 rounded-xl"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color: "var(--text-muted-3)" }}>
        Evidence type
      </span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        <span className="font-semibold" style={{ color: "var(--text)" }}>{info.label}</span>
        {" — "}
        {detail ?? info.detail}
      </span>
    </div>
  );
}
