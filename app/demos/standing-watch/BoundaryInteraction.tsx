"use client";

import { useRef, type KeyboardEvent } from "react";
import { FLAGGED, severityStyle, statusStyle } from "../../../lib/standing-watch-findings";

// DOM layer bridging state <-> BoundaryScene — the canvas isn't focusable,
// so this findings list + detail panel is the real, primary control surface
// (docs/design/3d-design-standard.md §5.4), same pattern as
// agent-checkpoint-walk/Interaction.tsx. Reads the exact same FLAGGED array
// the table above and the 3D scene both import — one source, three views.
export default function BoundaryInteraction({
  selectedIndex,
  onSelect,
  isPlaying,
  canReplay,
  onReplay,
}: {
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  isPlaying: boolean;
  /** False until the WebGL scene has actually mounted (or when it fell back to the no-WebGL table) — see BoundaryCanvasLoader.tsx. */
  canReplay: boolean;
  onReplay: () => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const selected = selectedIndex !== null ? FLAGGED[selectedIndex] : null;

  function handleListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-finding-item]") ?? []);
    if (buttons.length === 0) return;
    const currentIndex = buttons.findIndex((b) => b === document.activeElement);
    let nextIndex = currentIndex;
    if (e.key === "ArrowDown") nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, buttons.length - 1);
    if (e.key === "ArrowUp") nextIndex = currentIndex < 0 ? 0 : Math.max(currentIndex - 1, 0);
    buttons[nextIndex]?.focus();
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4 min-w-0" data-testid="boundary-interaction">
      {/* Findings list (primary control surface) */}
      <div className="rounded-2xl p-4 min-w-0" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h3 className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "var(--accent)" }}>
          Findings ({FLAGGED.length})
        </h3>
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Security-watch findings"
          onKeyDown={handleListKeyDown}
          className="max-h-72 overflow-y-auto flex flex-col gap-1 pr-1 mb-4"
        >
          {FLAGGED.map((row, i) => {
            const isSelected = i === selectedIndex;
            return (
              <li key={i} className="min-w-0">
                <button
                  type="button"
                  data-finding-item
                  data-testid={`boundary-finding-item-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelect(isSelected ? null : i)}
                  className="w-full min-w-0 text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start gap-2"
                  style={{
                    background: isSelected ? "#C8340615" : "transparent",
                    border: isSelected ? "1px solid #C8340630" : "1px solid transparent",
                    color: "var(--text)",
                  }}
                >
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide shrink-0" style={severityStyle[row.severity]}>
                    {row.severity}
                  </span>
                  <span className="truncate min-w-0 flex-1">{row.finding}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            data-testid="boundary-replay-button"
            onClick={onReplay}
            disabled={isPlaying || !canReplay}
            className="w-full text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent-on-tint)" }}
          >
            {isPlaying ? "Replaying…" : "▶ Replay Aug 10, 2026"}
          </button>
          <p className="text-[10px] text-slate-500 mt-2 leading-snug">
            Sequence shown for clarity — all nine rows share one real capture date, not real timing
            gaps, so this plays them at a fixed, deliberately even cadence rather than implying a
            timeline that doesn&apos;t exist.
          </p>
        </div>
      </div>

      {/* Detail panel */}
      <div
        className="rounded-2xl p-4 min-w-0"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        data-testid="boundary-detail-panel"
      >
        {selected ? (
          <div data-testid="boundary-finding-detail">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide" style={severityStyle[selected.severity]}>
                {selected.severity}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={statusStyle[selected.status]}>
                {selected.status === "fixed" ? "Fixed & verified" : "Left for human"}
              </span>
            </div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
              {selected.finding}
            </h3>
            <p className="text-xs text-slate-500 mb-3 font-mono">{selected.host}</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {selected.note}
            </p>
            {selected.status === "human" && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }} data-testid="boundary-wall-copy">
                  This is the one ribbon in the scene that stops at the wall instead of landing —
                  not a failure. Enabling disk encryption needs Recovery Mode / physical console
                  access, which nothing the automation runs with can reach. The system flags what
                  it can&apos;t safely act on and says so, instead of reaching for access it
                  shouldn&apos;t have.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
              Select a finding
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Click or arrow-key through the list to see one of the 9 real findings from this
              incident, or press Replay to watch all nine cross the gate at once.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
