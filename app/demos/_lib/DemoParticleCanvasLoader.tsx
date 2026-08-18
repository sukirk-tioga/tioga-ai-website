"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ssr: false must be called from a client component -- same isolation
// reason as ShowcaseCanvasLoader.tsx.
const DemoParticleFieldScene = dynamic(() => import("./DemoParticleField"), { ssr: false });

type Mode = "loading" | "scene" | "off";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

// Fallback here is simply not rendering the canvas -- unlike /showcase,
// there's no separate table to fall back to: the demo tabs' existing 2D
// UI (confidence bars, result cards) already carries the exact same real
// data this scene visualizes. No WebGL / prefers-reduced-motion / a lost
// context all just mean "no particle field today," not a degraded
// experience of the actual demo.
export default function DemoParticleCanvasLoader() {
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(detectWebGL() && !reducedMotion ? "scene" : "off");
  }, []);

  if (mode !== "scene") {
    return null;
  }

  return (
    <div
      className="rounded-2xl overflow-hidden hidden md:block"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", height: "320px" }}
      data-testid="demos-particle-canvas"
    >
      <DemoParticleFieldScene onContextLost={() => setMode("off")} />
    </div>
  );
}
