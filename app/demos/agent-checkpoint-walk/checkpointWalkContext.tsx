"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { DispositionEvent, Tier } from "../../../lib/agent-register";
import { DEFAULT_AGENT_ID } from "./checkpointLayout";

// Selection + animation-phase state shared between the DOM control layer
// (Interaction.tsx — the primary control, same accessibility pattern as
// reachMapContext.tsx) and the canvas (Scene.tsx). Phase transitions here
// are discrete, event-driven state (a click, or a scene callback firing
// once when a pulse reaches a waypoint) — same reasoning as
// reachMapContext.tsx's own header: Scene.tsx's useFrame loop still reads
// continuously-changing values (elapsed time since a phase started) from
// local refs/clock, never from this context.
export type WalkPhase =
  | "idle"
  | "crossing" // agent-owned: one continuous agent -> gate -> system sweep, no stop
  | "to-gate" // human-supervised: first leg, agent -> gate
  | "paused-at-gate" // human-supervised: waiting on Approve / Let it time out
  | "to-system" // human-supervised, post-approval: second leg, gate -> system
  | "arrived" // landed at the system (terminal)
  | "returning" // human-supervised, post-timeout: gate -> agent
  | "returned"; // back at the agent tile, did not land (terminal)

export interface CheckpointWalkSelection {
  selectedAgentId: string | null;
  selectedWriteIndex: number | null;
  walkPhase: WalkPhase;
  replayRunning: boolean;
  replaySeq: number;
  replayLog: DispositionEvent[];
  replayDone: boolean;
}

export interface CheckpointWalkContextValue extends CheckpointWalkSelection {
  selectAgent: (id: string | null) => void;
  selectWrite: (index: number | null) => void;
  startWalk: (tier: Tier) => void;
  arriveAtGate: () => void; // Scene -> context: human-supervised leg1 complete
  approve: () => void; // DOM -> context: visitor clicked Approve
  letItTimeOut: () => void; // DOM -> context: visitor clicked "Let it time out"
  completeCrossing: () => void; // Scene -> context: agent-owned full sweep complete
  completeArrival: () => void; // Scene -> context: human-supervised leg2 complete
  completeReturn: () => void; // Scene -> context: timeout return leg complete
  startReplay: () => void;
  onReplayEventLanded: (event: DispositionEvent) => void;
  completeReplay: () => void;
}

const DEFAULT_SELECTION: CheckpointWalkSelection = {
  selectedAgentId: DEFAULT_AGENT_ID,
  selectedWriteIndex: 0,
  walkPhase: "idle",
  replayRunning: false,
  replaySeq: 0,
  replayLog: [],
  replayDone: false,
};

const noop = () => {};

const CheckpointWalkContext = createContext<CheckpointWalkContextValue>({
  ...DEFAULT_SELECTION,
  selectAgent: noop,
  selectWrite: noop,
  startWalk: noop,
  arriveAtGate: noop,
  approve: noop,
  letItTimeOut: noop,
  completeCrossing: noop,
  completeArrival: noop,
  completeReturn: noop,
  startReplay: noop,
  onReplayEventLanded: noop,
  completeReplay: noop,
});

// Terminal/idle phases a fresh walk may legally start from — guards against
// a stray double-trigger firing mid-transit.
const STARTABLE_PHASES: WalkPhase[] = ["idle", "arrived", "returned"];

export function CheckpointWalkProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckpointWalkSelection>(DEFAULT_SELECTION);

  const value = useMemo<CheckpointWalkContextValue>(
    () => ({
      ...state,
      selectAgent: (id) =>
        setState((s) => ({
          ...s,
          selectedAgentId: id,
          selectedWriteIndex: id ? 0 : null,
          walkPhase: "idle",
        })),
      selectWrite: (index) => setState((s) => ({ ...s, selectedWriteIndex: index, walkPhase: "idle" })),
      // Only agent-owned and human-supervised edges ever get a "Start walk"
      // trigger rendered in Interaction.tsx (human-owned edges have no
      // pulse to trigger at all — task spec), so `tier` here is never
      // "human-owned" in practice; the guard below is the second, redundant
      // line of defense against a stray re-trigger mid-transit.
      startWalk: (tier) =>
        setState((s) => {
          if (!STARTABLE_PHASES.includes(s.walkPhase)) return s;
          return { ...s, walkPhase: tier === "agent-owned" ? "crossing" : "to-gate" };
        }),
      arriveAtGate: () => setState((s) => (s.walkPhase === "to-gate" ? { ...s, walkPhase: "paused-at-gate" } : s)),
      approve: () => setState((s) => (s.walkPhase === "paused-at-gate" ? { ...s, walkPhase: "to-system" } : s)),
      letItTimeOut: () => setState((s) => (s.walkPhase === "paused-at-gate" ? { ...s, walkPhase: "returning" } : s)),
      completeCrossing: () => setState((s) => (s.walkPhase === "crossing" ? { ...s, walkPhase: "arrived" } : s)),
      completeArrival: () => setState((s) => (s.walkPhase === "to-system" ? { ...s, walkPhase: "arrived" } : s)),
      completeReturn: () => setState((s) => (s.walkPhase === "returning" ? { ...s, walkPhase: "returned" } : s)),
      startReplay: () =>
        setState((s) => ({
          ...s,
          replayRunning: true,
          replaySeq: s.replaySeq + 1,
          replayLog: [],
          replayDone: false,
        })),
      onReplayEventLanded: (event) => setState((s) => ({ ...s, replayLog: [...s.replayLog, event] })),
      completeReplay: () => setState((s) => ({ ...s, replayRunning: false, replayDone: true })),
    }),
    [state]
  );

  return <CheckpointWalkContext.Provider value={value}>{children}</CheckpointWalkContext.Provider>;
}

export function useCheckpointWalk() {
  return useContext(CheckpointWalkContext);
}
