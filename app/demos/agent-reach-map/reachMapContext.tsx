"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SystemId } from "../../../lib/agent-register";

// Selection state shared between the DOM control layer (Interaction.tsx —
// the primary control per docs/design/3d-design-standard.md §5.4) and the
// canvas (Scene.tsx), same shape as app/demos/_lib/demo-activity-context.tsx
// (a plain React context, not a heavier state library, for a small,
// event-driven piece of shared state). Selection changes are event-driven
// (a click, a hover, a keypress), not per-frame — unlike the corridor's
// gateActivity ref, plain React state here is correct, not a performance
// risk (Scene.tsx's useFrame loops still read continuously-changing values,
// e.g. shimmer phase, from local refs/clock, never from here).
export interface ReachMapSelection {
  selectedAgentId: string | null;
  hoveredAgentId: string | null;
  selectedSystemId: SystemId | null;
  hoveredSystemId: SystemId | null;
  unsupervisedOnly: boolean;
}

export interface ReachMapContextValue extends ReachMapSelection {
  selectAgent: (id: string | null) => void;
  hoverAgent: (id: string | null) => void;
  selectSystem: (id: SystemId | null) => void;
  hoverSystem: (id: SystemId | null) => void;
  setUnsupervisedOnly: (value: boolean) => void;
  toggleUnsupervisedOnly: () => void;
}

const DEFAULT_SELECTION: ReachMapSelection = {
  selectedAgentId: null,
  hoveredAgentId: null,
  selectedSystemId: null,
  hoveredSystemId: null,
  unsupervisedOnly: false,
};

const ReachMapContext = createContext<ReachMapContextValue>({
  ...DEFAULT_SELECTION,
  selectAgent: () => {},
  hoverAgent: () => {},
  selectSystem: () => {},
  hoverSystem: () => {},
  setUnsupervisedOnly: () => {},
  toggleUnsupervisedOnly: () => {},
});

export function ReachMapProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReachMapSelection>(DEFAULT_SELECTION);

  const value = useMemo<ReachMapContextValue>(
    () => ({
      ...state,
      selectAgent: (id) =>
        setState((s) => ({ ...s, selectedAgentId: id, selectedSystemId: id ? null : s.selectedSystemId })),
      hoverAgent: (id) => setState((s) => (s.hoveredAgentId === id ? s : { ...s, hoveredAgentId: id })),
      selectSystem: (id) =>
        setState((s) => ({ ...s, selectedSystemId: id, selectedAgentId: id ? null : s.selectedAgentId })),
      hoverSystem: (id) => setState((s) => (s.hoveredSystemId === id ? s : { ...s, hoveredSystemId: id })),
      setUnsupervisedOnly: (value) => setState((s) => ({ ...s, unsupervisedOnly: value })),
      toggleUnsupervisedOnly: () => setState((s) => ({ ...s, unsupervisedOnly: !s.unsupervisedOnly })),
    }),
    [state]
  );

  return <ReachMapContext.Provider value={value}>{children}</ReachMapContext.Provider>;
}

export function useReachMap() {
  return useContext(ReachMapContext);
}
