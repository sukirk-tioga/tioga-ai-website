"use client";

import { useMemo, useRef, type CSSProperties, type KeyboardEvent } from "react";
import { AGENTS, SYSTEMS, type SystemId, type Tier } from "../../../lib/agent-register";
import { useReachMap } from "./reachMapContext";

// The DOM layer bridging state <-> Scene, per
// docs/design/3d-design-standard.md §5.4 (this scene's own accessibility
// requirement, same shape as app/demos/_lib/demo-activity-context.tsx):
// the canvas is not focusable and never will be, so this agent list is the
// PRIMARY control, not a mirror of canvas-only interaction — arrow keys
// move selection, Enter/click inspects (native <button> semantics), and
// the toggle is a real <button aria-pressed>. Selecting an agent via this
// list or via a canvas click both write into the same reachMapContext
// state, so Scene.tsx's edge/node highlighting mirrors either path
// identically. Mobile gets these as a real tap target that isn't the
// canvas.

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

function systemName(id: SystemId): string {
  return SYSTEMS.find((s) => s.id === id)?.name ?? id;
}

// Computed live from AGENTS, not hardcoded — the exact number a buyer
// actually wants: how many agents can write to a given system, and how
// many of those writes are unsupervised (agent-owned, no approval gate).
function systemWriteStats(systemId: SystemId): { total: number; unsupervised: number } {
  const writers = AGENTS.filter((a) => a.writes.some((w) => w.system === systemId));
  const unsupervised = writers.filter((a) =>
    a.writes.some((w) => w.system === systemId && w.tier === "agent-owned")
  );
  return { total: writers.length, unsupervised: unsupervised.length };
}

export default function Interaction() {
  const {
    selectedAgentId,
    selectedSystemId,
    hoveredSystemId,
    selectAgent,
    selectSystem,
    unsupervisedOnly,
    toggleUnsupervisedOnly,
  } = useReachMap();

  const listRef = useRef<HTMLUListElement>(null);

  const selectedAgent = useMemo(() => AGENTS.find((a) => a.id === selectedAgentId) ?? null, [selectedAgentId]);
  const activeSystemId = selectedSystemId ?? hoveredSystemId;
  const activeSystem = useMemo(() => SYSTEMS.find((s) => s.id === activeSystemId) ?? null, [activeSystemId]);
  const activeSystemStats = activeSystemId ? systemWriteStats(activeSystemId) : null;

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
    <div className="grid md:grid-cols-2 gap-4 mt-4" data-testid="agent-reach-map-interaction">
      {/* Controls + agent list (primary control surface) */}
      <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--accent)" }}>
            Agents ({AGENTS.length})
          </h3>
          <button
            type="button"
            onClick={toggleUnsupervisedOnly}
            aria-pressed={unsupervisedOnly}
            data-testid="unsupervised-toggle"
            className="text-[11px] font-mono px-3 py-1.5 rounded-full transition-colors shrink-0"
            style={
              unsupervisedOnly
                ? { color: "var(--accent-on-tint)", background: "#C8340615", border: "1px solid #C8340630" }
                : { color: "var(--text-muted-3)", background: "var(--bg-dark)", border: "1px solid var(--border)" }
            }
          >
            {unsupervisedOnly ? "Unsupervised writes only: on" : "Unsupervised writes only: off"}
          </button>
        </div>
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Scheduled agents"
          onKeyDown={handleListKeyDown}
          className="max-h-80 overflow-y-auto flex flex-col gap-1 pr-1"
        >
          {AGENTS.map((agent) => {
            const isSelected = agent.id === selectedAgentId;
            const hasUnsupervised = agent.writes.some((w) => w.tier === "agent-owned");
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
                  {hasUnsupervised && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={TIER_DOT_STYLE["agent-owned"]}
                      title="Has at least one unsupervised (agent-owned) write"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Detail panel */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        data-testid="reach-map-detail-panel"
      >
        {selectedAgent ? (
          <div data-testid="reach-map-agent-detail">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
              {selectedAgent.name}
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">{selectedAgent.schedule}</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{selectedAgent.purpose}</p>

            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: "var(--text-muted-3)" }}>
              Reads
            </p>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              {selectedAgent.reads.length ? selectedAgent.reads.map(systemName).join(", ") : "None"}
            </p>

            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: "var(--text-muted-3)" }}>
              Writes
            </p>
            {selectedAgent.writes.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] mb-3">
                Advisory only — this agent never mutates a system directly.
              </p>
            ) : (
              <div className="flex flex-col gap-2 mb-3">
                {selectedAgent.writes.map((w, i) => (
                  <div
                    key={i}
                    className="text-xs p-2 rounded-lg"
                    style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium" style={{ color: "var(--text)" }}>
                        {systemName(w.system)}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={TIER_DOT_STYLE[w.tier]} />
                        {TIER_LABEL[w.tier]}
                      </span>
                    </div>
                    {w.approver && <p className="text-[11px] text-slate-500 mb-1">Approver: {w.approver}</p>}
                    <p className="text-[11px] text-[var(--text-muted)] leading-snug">{w.note}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: "var(--text-muted-3)" }}>
              Blast radius
            </p>
            <p className="text-xs text-[var(--text-muted)]">{selectedAgent.blastRadius}</p>
          </div>
        ) : activeSystem && activeSystemStats ? (
          <div data-testid="reach-map-system-detail">
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
              {activeSystem.name}
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{activeSystem.description}</p>
            <p className="text-xs" style={{ color: "var(--text)" }}>
              <span className="font-semibold">{activeSystemStats.total}</span> agent
              {activeSystemStats.total === 1 ? "" : "s"} can write here;{" "}
              <span className="font-semibold" style={{ color: "var(--accent)" }}>
                {activeSystemStats.unsupervised}
              </span>{" "}
              of them unsupervised.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
              Select an agent
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
              Click or arrow-key through the list on the left, or click a node in the scene, to see
              what it&apos;s authorized to read and write. Click a system below (or its node in the
              scene) to see how many agents can write to it and how many of those writes are
              unsupervised.
            </p>
            <ul className="flex flex-col gap-1">
              {SYSTEMS.map((s) => {
                const stats = systemWriteStats(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      data-testid={`system-item-${s.id}`}
                      onClick={() => selectSystem(s.id)}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] flex items-center justify-between gap-2 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <span className="truncate">{s.name}</span>
                      <span className="font-mono text-[10px] shrink-0" style={{ color: "var(--text-muted-3)" }}>
                        {stats.total} / {stats.unsupervised} unsup.
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
