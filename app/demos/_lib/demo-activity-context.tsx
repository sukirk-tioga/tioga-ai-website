"use client";

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";

// Phase 5b (working-list.md, 2026-08-17 Snowflake session backlog item —
// "/demos goes live for real", see
// research/3d-web-design-boundary-push-2026-08-15.md §Phase 5 part B):
// a persistent particle field on /demos that reacts to the visitor's own
// real API call, not a fabricated animation. This context is the one
// source of truth each demo tab (InvoiceDemo, EmailTriageDemo,
// DocumentDemo) reports its real fetch state into, and the only thing
// DemoParticleField.tsx is allowed to read from — see the 3D design
// standard §3 (the honesty rule): every particle-field state below must
// trace to something that actually happened in this browser tab.
//
// `confidence` is deliberately `number | null`, not defaulted to 0 or
// omitted -- EmailTriageDemo's result shape carries no confidence field at
// all, and rendering a fabricated number for it would violate the honesty
// rule exactly the way an invented "15 of 17 calls" stat once did on
// /showcase. `null` means "this demo has no such value," and
// DemoParticleField.tsx must render that as an honestly neutral resolved
// state, not guess.
export type DemoActivityStatus = "idle" | "pending" | "done" | "error";

export interface DemoActivityState {
  status: DemoActivityStatus;
  confidence: number | null;
}

const DEFAULT_STATE: DemoActivityState = { status: "idle", confidence: null };

const DemoActivityContext = createContext<DemoActivityState>(DEFAULT_STATE);
const DemoActivitySetterContext = createContext<(state: DemoActivityState) => void>(() => {});

export function DemoActivityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoActivityState>(DEFAULT_STATE);
  // Stable setter identity so consumers' useEffect/useCallback deps don't
  // churn on every provider re-render.
  const setter = useMemo(() => setState, []);
  return (
    <DemoActivityContext.Provider value={state}>
      <DemoActivitySetterContext.Provider value={setter}>{children}</DemoActivitySetterContext.Provider>
    </DemoActivityContext.Provider>
  );
}

export function useDemoActivity() {
  return useContext(DemoActivityContext);
}

export function useSetDemoActivity() {
  return useContext(DemoActivitySetterContext);
}
