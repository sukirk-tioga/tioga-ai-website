"use client";

import { useMemo, useState } from "react";
import DemoShell from "../_lib/demo-shell";
import {
  GARTNER_TIERS,
  TIOGA_TIERS,
  PRESETS,
  GARTNER_SOURCE_NOTE,
  GARTNER_STAT_NOTE,
  mapToTiogaTier,
  type GartnerTierId,
  type Stakes,
  type TiogaTierId,
} from "./lib/tiers";

// Everything on this page runs in your browser; nothing is sent to a
// server — same as the capital-equipment-order and ap-exception-workflow
// demos' deterministic policy logic, and the EU AI Act Readiness
// Calculator. The mapping is authored rules against a published framework,
// not a model call.

const GARTNER_QUESTION_OPTIONS: { id: GartnerTierId; label: string }[] = [
  { id: "observe", label: "Reads data and summarizes/reports on it" },
  { id: "advise", label: "Recommends an action, but a human decides & performs it separately" },
  { id: "act_with_approval", label: "Prepares/stages an action, but doesn't finalize it until a human signs off" },
  { id: "act_autonomously", label: "Executes the action itself — no human reviews that specific instance" },
];

const TIOGA_TIER_COLOR: Record<TiogaTierId, string> = {
  safe: "var(--success)",
  ask_first: "var(--warning-light)",
  never: "var(--error-light)",
};

// var() can't be alpha-suffixed inline (see CLAUDE.md) — these raw hex
// literals are the same values as the --success/--warning-light/--error-light
// tokens above, used only for the alpha-tinted backgrounds/borders below.
const TIOGA_TIER_HEX: Record<TiogaTierId, string> = {
  safe: "#4ADE80",
  ask_first: "#FBBF24",
  never: "#F87171",
};

function SelectButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3.5 rounded-xl transition-all"
      style={{
        background: selected ? "#EC6D3D15" : "var(--bg-dark)",
        border: `1px solid ${selected ? "#EC6D3D50" : "var(--border)"}`,
        color: selected ? "var(--accent)" : "var(--text-muted)",
      }}
    >
      {children}
    </button>
  );
}

export default function AgentAutonomyMapperPage() {
  const [mode, setMode] = useState<"preset" | "custom" | null>(null);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [customTier, setCustomTier] = useState<GartnerTierId | null>(null);
  const [customSelfApproval, setCustomSelfApproval] = useState<boolean | null>(null);
  const [customStakes, setCustomStakes] = useState<Stakes | null>(null);

  const preset = presetId ? PRESETS.find((p) => p.id === presetId) ?? null : null;

  const activeTier: GartnerTierId | null =
    mode === "preset" ? preset?.gartnerTier ?? null : mode === "custom" ? customTier : null;

  const needsFollowUps = activeTier === "act_autonomously";

  const followUpsAnswered =
    mode === "preset" ? true : !needsFollowUps || (customSelfApproval !== null && customStakes !== null);

  const result = useMemo(() => {
    if (!activeTier || !followUpsAnswered) return null;
    if (mode === "preset" && preset) {
      return mapToTiogaTier(preset.gartnerTier, {
        selfApprovalConflict: preset.selfApprovalConflict,
        stakes: preset.stakes,
      });
    }
    if (mode === "custom" && customTier) {
      return mapToTiogaTier(customTier, {
        selfApprovalConflict: customSelfApproval ?? false,
        stakes: customStakes ?? "low",
      });
    }
    return null;
  }, [activeTier, followUpsAnswered, mode, preset, customTier, customSelfApproval, customStakes]);

  const selectPreset = (id: string) => {
    setMode("preset");
    setPresetId(id);
  };

  const selectCustom = () => {
    setMode("custom");
    setPresetId(null);
  };

  const setCustomGartnerTier = (id: GartnerTierId) => {
    setCustomTier(id);
    setCustomSelfApproval(null);
    setCustomStakes(null);
  };

  const gartnerTierInfo = activeTier ? GARTNER_TIERS[activeTier] : null;
  const tiogaTierInfo = result ? TIOGA_TIERS[result.tiogaTier] : null;
  const tiogaColor = result ? TIOGA_TIER_COLOR[result.tiogaTier] : "var(--accent)";
  const tiogaHex = result ? TIOGA_TIER_HEX[result.tiogaTier] : "#EC6D3D";

  return (
    <DemoShell
      title="Agent Autonomy Tier Mapper"
      badge="Self-Assessment — Rules-Based, Not a Model Call"
      description="Describe an AI-agent use case — or pick a preset — and see where it lands on Gartner's four-tier autonomy framework, and the corresponding Tioga Safe/Ask-first/Never governance tier."
    >
      {/* Step 1: pick a use case */}
      <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-white mb-1">What's the use case?</h2>
        <p className="text-sm text-slate-400 mb-5">
          Pick one of these SAP/Oracle-relevant examples, or describe your own agent.
        </p>

        <div className="space-y-2 mb-4">
          {PRESETS.map((p) => (
            <SelectButton key={p.id} selected={mode === "preset" && presetId === p.id} onClick={() => selectPreset(p.id)}>
              <p className="text-sm font-medium mb-0.5" style={{ color: mode === "preset" && presetId === p.id ? "var(--accent)" : "white" }}>
                {p.label}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
            </SelectButton>
          ))}
          <SelectButton selected={mode === "custom"} onClick={selectCustom}>
            <p className="text-sm font-medium" style={{ color: mode === "custom" ? "var(--accent)" : "white" }}>
              Describe my own agent
            </p>
          </SelectButton>
        </div>

        {mode === "custom" && (
          <div className="pt-4 space-y-5" style={{ borderTop: "1px solid var(--border)" }}>
            <div>
              <p className="text-sm font-semibold text-white mb-3">What does the agent actually do?</p>
              <div className="space-y-2">
                {GARTNER_QUESTION_OPTIONS.map((o) => (
                  <SelectButton key={o.id} selected={customTier === o.id} onClick={() => setCustomGartnerTier(o.id)}>
                    <span className="text-sm">{o.label}</span>
                  </SelectButton>
                ))}
              </div>
            </div>

            {needsFollowUps && (
              <>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    Can this agent identity also approve or release its own action — no separate approver, ever?
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    e.g. the same agent that proposes a payment can also release it, with nobody else in the loop.
                  </p>
                  <div className="flex gap-3">
                    <SelectButton selected={customSelfApproval === true} onClick={() => setCustomSelfApproval(true)}>
                      <span className="text-sm">Yes</span>
                    </SelectButton>
                    <SelectButton selected={customSelfApproval === false} onClick={() => setCustomSelfApproval(false)}>
                      <span className="text-sm">No — a separate person/role controls that</span>
                    </SelectButton>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white mb-1">If this action went wrong, how bad would it be?</p>
                  <div className="flex gap-3">
                    <SelectButton selected={customStakes === "low"} onClick={() => setCustomStakes("low")}>
                      <span className="text-sm">Low stakes, easy to reverse</span>
                    </SelectButton>
                    <SelectButton selected={customStakes === "high"} onClick={() => setCustomStakes("high")}>
                      <span className="text-sm">High stakes — financial, contractual, or hard to reverse</span>
                    </SelectButton>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {gartnerTierInfo && tiogaTierInfo && result && (
        <div className="mt-8">
          <div className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: `1px solid ${tiogaHex}40` }}>
            <div className="grid sm:grid-cols-2 gap-4 pb-6 mb-6" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Gartner autonomy tier</p>
                <p className="text-lg font-bold text-white mb-1">{gartnerTierInfo.label}</p>
                <p className="text-xs mb-2" style={{ color: "var(--accent)" }}>{gartnerTierInfo.short}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{gartnerTierInfo.description}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Tioga governance tier</p>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-lg font-bold whitespace-nowrap" style={{ color: tiogaColor }}>{tiogaTierInfo.label}</p>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wide"
                    style={{ background: `${tiogaHex}15`, border: `1px solid ${tiogaHex}40`, color: tiogaColor }}
                  >
                    {tiogaTierInfo.short}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mt-2">{result.why}</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              This is a near-exact structural match: Gartner's four-tier scale (Observe → Advise → Act with
              Approval → Act Autonomously) and Tioga's own three-tier policy (Safe → Ask-first → Never) are
              measuring the same thing — how much unsupervised authority an agent has over a given action — from
              two independent directions. Gartner arrived at this shape as an outside analyst firm surveying the
              market broadly; Tioga arrived at it building governed write-paths for real SAP/Oracle transactions.
              Neither copied the other.
            </p>
          </div>

          {/* Citations */}
          <div className="mt-4 p-5 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--accent)" }}>
              Source &amp; hedge
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">{GARTNER_SOURCE_NOTE}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{GARTNER_STAT_NOTE}</p>
          </div>

          <p className="text-xs text-slate-400 text-center mt-4 max-w-lg mx-auto">
            This is a directional self-assessment against a public analyst framework, not a governance audit —
            a real classification depends on facts a short quiz can&apos;t capture. Nothing you select here is
            saved or sent anywhere; the mapping runs entirely in your browser.
          </p>
        </div>
      )}
    </DemoShell>
  );
}
