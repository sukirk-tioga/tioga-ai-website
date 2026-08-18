"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ssr: false must be called from a client component in the App Router --
// same isolation pattern as ShowcaseCanvasLoader.tsx.
const HeroFieldScene = dynamic(() => import("./HeroFieldScene"), { ssr: false });

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

// Deterministic fallback: the original static blur-blob div this component
// replaces as the hero's background. No layout impact either way (both are
// position:absolute inside the hero section's own relative/overflow-hidden
// wrapper), so defaulting to this and only upgrading to the WebGL field
// once capability is confirmed means there's never a pop-in or a blank
// flash -- same reasoning as showcase's no-WebGL/reduced-motion fallback,
// just simpler here since there's no fixed-height placeholder to manage.
function StaticGlow() {
  return (
    <div
      className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 pointer-events-none"
      style={{ background: "radial-gradient(ellipse, var(--accent), transparent 70%)", filter: "blur(60px)" }}
    />
  );
}

export default function HeroFieldLoader() {
  const [showField, setShowField] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (detectWebGL() && !reducedMotion) setShowField(true);
  }, []);

  if (!showField) return <StaticGlow />;

  return (
    <div className="absolute -z-10 inset-0 pointer-events-none" data-testid="hero-field-canvas">
      <HeroFieldScene onContextLost={() => setShowField(false)} />
    </div>
  );
}
