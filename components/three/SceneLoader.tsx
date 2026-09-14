"use client";

import { useEffect, useState, type ReactNode } from "react";

export type SceneLoaderMode = "loading" | "scene" | "fallback";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export interface SceneLoaderProps {
  /** Rendered once the WebGL + reduced-motion checks pass. Receives the
   *  `onContextLost` callback to wire into the scene's own
   *  `webglcontextlost` handler — same pattern as ShowcaseScene.tsx. */
  renderScene: (onContextLost: () => void) => ReactNode;
  /** Rendered instead of the scene for no-WebGL, prefers-reduced-motion, or
   *  a lost graphics context — must be the same real data as a table
   *  (docs/design/3d-design-standard.md §5.3), never a blank canvas. */
  fallback: ReactNode;
  /** Used for both the loading skeleton and the mounted canvas wrapper's
   *  `data-testid` (`${testIdPrefix}-loading` / `testIdPrefix`). */
  testIdPrefix: string;
  height?: string;
  onModeChange?: (mode: SceneLoaderMode) => void;
}

// Generalized from app/showcase/ShowcaseCanvasLoader.tsx: the WebGL-detect +
// prefers-reduced-motion + webglcontextlost -> fallback state machine,
// with the showcase-specific Replay/audio-toggle UI removed so a new 3D
// route can reuse the same three-way mode switch without carrying that
// page's own controls. ShowcaseCanvasLoader itself was left as-is (not
// rewritten on top of this) — its Replay/sound UI doesn't fit this
// generic shape cleanly, and the task calling for this kit explicitly
// flagged that risk over reward for touching a shipped page.
export default function SceneLoader({
  renderScene,
  fallback,
  testIdPrefix,
  height = "560px",
  onModeChange,
}: SceneLoaderProps) {
  const [mode, setModeState] = useState<SceneLoaderMode>("loading");

  const setMode = (m: SceneLoaderMode) => {
    setModeState(m);
    onModeChange?.(m);
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasWebGL = detectWebGL();
    setMode(hasWebGL && !reducedMotion ? "scene" : "fallback");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mode === "loading") {
    return (
      <div
        className="rounded-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", height }}
        data-testid={`${testIdPrefix}-loading`}
      />
    );
  }

  if (mode === "fallback") {
    return <>{fallback}</>;
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", height }}
      data-testid={testIdPrefix}
    >
      {renderScene(() => setMode("fallback"))}
    </div>
  );
}
