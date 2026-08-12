"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ShowcaseFallback from "./ShowcaseFallback";

// ssr: false must be called from a client component in the App Router —
// this loader exists solely to isolate that call from the server-component
// page.tsx (which carries the route metadata).
const ShowcaseScene = dynamic(() => import("./ShowcaseScene"), { ssr: false });

type Mode = "loading" | "scene" | "fallback";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export default function ShowcaseCanvasLoader() {
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    // Deterministic fallbacks (plan §3): no WebGL, prefers-reduced-motion,
    // or (below, via onContextLost) a lost graphics context on a
    // backgrounded tab all resolve to the same table view, not a blank
    // canvas or a silently frozen one.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasWebGL = detectWebGL();
    setMode(hasWebGL && !reducedMotion ? "scene" : "fallback");
  }, []);

  if (mode === "loading") {
    return (
      <div
        className="rounded-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", height: "560px" }}
        data-testid="showcase-canvas-loading"
      />
    );
  }

  if (mode === "fallback") {
    return <ShowcaseFallback />;
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", height: "560px" }}
      data-testid="showcase-canvas"
    >
      <ShowcaseScene onContextLost={() => setMode("fallback")} />
    </div>
  );
}
