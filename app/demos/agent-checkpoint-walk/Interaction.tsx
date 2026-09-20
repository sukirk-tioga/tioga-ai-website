"use client";

import { useMemo, useRef, type CSSProperties, type KeyboardEvent } from "react";
import { AGENTS, DISPOSITIONS, type Tier } from "../../../lib/agent-register";
import { useCheckpointWalk } from "./checkpointWalkContext";
import {
  agentWrites,
  crossingCopy,
  pausedApproverLabel,
  approveCopy,
  timeoutCopy,
  advisoryOnlyCopy,
  noWritesCopy,
  systemRow,
  REPLAY_STEP_SECONDS,
} from "./checkpointLayout";

// The DOM layer bridging state <-> Scene, same primary-control pattern as
// agent-reach-map/Interaction.tsx (docs/design/3d-design-standard.md
// §5.4): the canvas is not focusable, so this agent list + write-edge
// panel is the real control surface, not a mirror of canvas-only
// interaction. The full 29-agent list is always shown — no curated subset
// (task spec).

const TIER_LABEL: Record<Tier, string> = {
  "agent-owned": "Agent-owned (unsupervised)",
  "human-supervised": "Human-supervised",
  "human-owned": "Human-owned (advisory)",
};

const TIER_DOT_STYLE: Record<Tier, CSSProperties> = {
  "agent-owned": { background: "var(--accent)" },
  "human-supervised": { background: "var(--warning)" },
  "human-owned": { background: "var(--border)" },
};

export default function Interaction() {
  const {
    selectedAgentId,
    selectedWriteIndex,
    walkPhase,
    selectAgent,
    selectWrite,
    startWalk,
    approve,
    letItTimeOut,
    replayRunning,
    replayLog,
    replayDone,
    startReplay,
  } = useCheckpointWalk();

  const listRef = useRef<HTMLUListElement>(null);

  const selectedAgent = useMemo(() => AGENTS.find((a) => a.id === selectedAgentId) ?? null, [selectedAgentId]);
  const lanes = useMemo(() => (selectedAgent ? agentWrites(selectedAgent) : []), [selectedAgent]);
  const activeLane = selectedWriteIndex !== null ? lanes[selectedWriteIndex] : undefined;

  const canStartWalk = walkPhase === "idle" || walkPhase === "arrived" || walkPhase === "returned";
  const isMidTransit = walkPhase === "crossing" || walkPhase === "to-gate" || walkPhase === "to-system" || walkPhase === "returning";

  function handleListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-agent-item]") ?? []
    );
    if (buttons.length === 0) return;
    const currentIndex = buttons.findIndex((b) => b === document.activeElement);
    let nextIndex = currentIndex;
    if (e.key === "ArrowDown") nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, buttons.length - 1);
    if (e.key === "ArrowUp") nextIndex = currentIndex < 0 ? 0 : Math.max(currentIndex - 1, 0);
    buttons[nextIndex]?.focus();
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4" data-testid="agent-checkpoint-walk-interaction">
      {/* Controls + agent list (primary control surface) */}
      <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h3 className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "var(--accent)" }}>
          Agents ({AGENTS.length})
        </h3>
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Scheduled agents"
          onKeyDown={handleListKeyDown}
          className="max-h-64 overflow-y-auto flex flex-col gap-1 pr-1 mb-4"
        >
          {AGENTS.map((agent) => {
            const isSelected = agent.id === selectedAgentId;
            return (
              <li key={agent.id} role="presentation">
                <button
                  type="button"
                  data-agent-item
                  data-testid={`agent-item-${agent.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectAgent(isSelected ? null : agent.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2"
                  style={{
                    background: isSelected ? "#C8340615" : "transparent",
                    border: isSelected ? "1px solid #C8340630" : "1px solid transparent",
                    color: "var(--text)",
                  }}
                >
                  <span className="truncate">{agent.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Replay control — dated real DISPOSITIONS, not a curated subset,
            not a live feed. */}
        <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            data-testid="replay-findings-button"
            onClick={startReplay}
            disabled={replayRunning}
            className="w-full text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            style={{
              background: replayRunning ? "var(--bg-dark)" : "#C8340615",
              border: "1px solid #C8340630",
              color: replayRunning ? "var(--text-muted-3)" : "var(--accent-on-tint)",
            }}
          >
            {replayRunning ? "Replaying real findings…" : "Replay real findings"}
          </button>
          <p className="text-[10px] text-slate-500 mt-2 leading-snug">
            {DISPOSITIONS.length} real, dated findings from Tioga&apos;s own automation-review cycle, played through
            the same gate {REPLAY_STEP_SECONDS}s apart — a fixed UI pace, not the real (unrecorded, day-granularity
            only) gaps between them.
          </p>
          {replayLog.length > 0 && (
            <ul data-testid="replay-log" className="flex flex-col gap-1.5 mt-3">
              {replayLog.map((event, i) => (
                <li
                  key={i}
                  data-testid={`replay-log-item-${i}`}
                  className="text-[11px] p-2 rounded-lg"
                  style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
                >
                  <span className="font-mono text-[10px] text-slate-500">{event.date}</span>{" "}
                  <span
                    className="font-semibold"
                    style={{ color: event.disposition === "auto-implemented" ? "var(--accent)" : "var(--warning)" }}
                  >
                    {event.disposition}
                  </span>
                  <p className="text-[var(--text-muted)] mt-0.5 leading-snug">{event.finding}</p>
                </li>
              ))}
            </ul>
          )}
          {replayDone && (
            <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }} data-testid="replay-complete">
              Replay complete — all {DISPOSITIONS.length} real findings shown.
            </p>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        data-testid="checkpoint-walk-detail-panel"
      >
        {selectedAgent ? (
          <div data-testid="checkpoint-walk-agent-detail">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
              {selectedAgent.name}
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">{selectedAgent.schedule}</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{selectedAgent.purpose}</p>

            {lanes.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]" data-testid="checkpoint-no-writes">
                {noWritesCopy(selectedAgent)}
              </p>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: "var(--text-muted-3)" }}>
                  Write edges — pick one to walk
                </p>
                <div className="flex flex-col gap-2 mb-3">
                  {lanes.map(({ write, writeIndex }) => {
                    const isActiveLane = writeIndex === selectedWriteIndex;
                    return (
                      <button
                        key={writeIndex}
                        type="button"
                        data-testid={`write-item-${selectedAgent.id}-${writeIndex}`}
                        onClick={() => selectWrite(writeIndex)}
                        className="text-left text-xs p-2 rounded-lg transition-colors"
                        style={{
                          background: isActiveLane ? "var(--bg-dark)" : "transparent",
                          border: isActiveLane ? "1px solid var(--border)" : "1px solid transparent",
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-medium" style={{ color: "var(--text)" }}>
                            {systemRow(write.system).name}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={TIER_DOT_STYLE[write.tier]} />
                            {TIER_LABEL[write.tier]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeLane && (
                  <div
                    className="p-3 rounded-xl"
                    style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
                    data-testid="checkpoint-walk-write-detail"
                  >
                    {activeLane.write.tier === "human-owned" ? (
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }} data-testid="checkpoint-advisory-copy">
                        {advisoryOnlyCopy(activeLane.write)}
                      </p>
                    ) : (
                      <>
                        {walkPhase === "paused-at-gate" ? (
                          <div data-testid="checkpoint-paused-at-gate">
                            <p className="text-xs font-semibold mb-1" style={{ color: "var(--warning)" }}>
                              Paused at the gate
                            </p>
                            <p className="text-xs mb-1" style={{ color: "var(--text)" }}>
                              Approver: <span className="font-medium">{pausedApproverLabel(activeLane.write)}</span>
                            </p>
                            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
                              {activeLane.write.note}
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                data-testid="approve-button"
                                onClick={approve}
                                className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg"
                                style={{ background: "#A8681E15", border: "1px solid #A8681E30", color: "var(--warning)" }}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                data-testid="timeout-button"
                                onClick={letItTimeOut}
                                className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                              >
                                Let it time out
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 leading-snug">{approveCopy()}</p>
                          </div>
                        ) : walkPhase === "returned" ? (
                          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }} data-testid="checkpoint-returned-copy">
                            {timeoutCopy()}
                          </p>
                        ) : activeLane.write.tier === "agent-owned" ? (
                          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }} data-testid="checkpoint-crossing-copy">
                            {crossingCopy(activeLane.write)}
                          </p>
                        ) : (
                          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            Approver: <span className="font-medium" style={{ color: "var(--text)" }}>{pausedApproverLabel(activeLane.write)}</span>
                            {" — "}
                            {activeLane.write.note}
                          </p>
                        )}

                        {canStartWalk && (
                          <button
                            type="button"
                            data-testid="start-walk-button"
                            onClick={() => startWalk(activeLane.write.tier)}
                            className="w-full mt-3 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))", color: "white" }}
                          >
                            Start walk
                          </button>
                        )}
                        {isMidTransit && (
                          <p className="text-[11px] mt-3" style={{ color: "var(--text-muted-3)" }} data-testid="checkpoint-walking-status">
                            Walking…
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
              Select an agent
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Click or arrow-key through the list on the left to see what a real Tioga agent writes, and walk one of
              its real write edges through the checkpoint.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
