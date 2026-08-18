"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { moodForPathname } from "@/lib/solutions-moods";

// ssr: false must be called from a client component -- same isolation
// pattern as HeroFieldLoader.tsx / ShowcaseCanvasLoader.tsx.
const SolutionsFieldScene = dynamic(() => import("./SolutionsFieldScene"), { ssr: false });

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

// Deterministic no-WebGL / reduced-motion fallback: a static tinted glow
// matching the active mood, same "never blank, never pop-in" reasoning as
// HeroFieldLoader's StaticGlow.
function StaticGlow({ color }: { color: string }) {
  return (
    <div
      className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full opacity-10 pointer-events-none transition-colors duration-700"
      style={{ background: `radial-gradient(ellipse, ${color}, transparent 70%)`, filter: "blur(70px)" }}
    />
  );
}

// Mounted once in app/solutions/layout.tsx so the Canvas/WebGL context
// persists across navigation between the 8 solution sub-pages -- Next.js
// layouts don't remount on nested route changes, which is what makes the
// mood transition below read as "flying" between rooms in one shared
// space rather than a hard cut on every page load.
export default function SolutionsFieldLoader() {
  const [showField, setShowField] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const pathname = usePathname();
  const mood = moodForPathname(pathname ?? "/solutions");
  const [staticColor, setStaticColor] = useState(mood.color);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);
    if (detectWebGL() && !reduced) setShowField(true);
  }, []);

  // Tween to the new mood whenever the active solution changes -- the
  // "camera flies" beat. Direct uniform writes via GSAP, not React state,
  // matching the homepage pin's "never drive scroll/route-linked animation
  // from React state" rule.
  useEffect(() => {
    if (reducedMotion) {
      setStaticColor(mood.color); // instant, no tween, per reduced-motion rule
      return;
    }
    const mat = materialRef.current;
    if (!mat) return;
    const targetColor = new THREE.Color(mood.color);
    const targetColorDark = new THREE.Color(mood.colorDark);
    const tweenState = {
      r: mat.uniforms.uColor.value.r,
      g: mat.uniforms.uColor.value.g,
      b: mat.uniforms.uColor.value.b,
      dr: mat.uniforms.uColorDark.value.r,
      dg: mat.uniforms.uColorDark.value.g,
      db: mat.uniforms.uColorDark.value.b,
      panX: mat.uniforms.uPan.value.x,
      panY: mat.uniforms.uPan.value.y,
    };
    gsap.to(tweenState, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      dr: targetColorDark.r,
      dg: targetColorDark.g,
      db: targetColorDark.b,
      panX: mood.panX,
      panY: mood.panY,
      duration: 1.3,
      ease: "power2.inOut",
      onUpdate: () => {
        mat.uniforms.uColor.value.setRGB(tweenState.r, tweenState.g, tweenState.b);
        mat.uniforms.uColorDark.value.setRGB(tweenState.dr, tweenState.dg, tweenState.db);
        mat.uniforms.uPan.value.set(tweenState.panX, tweenState.panY);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood.color, mood.colorDark, mood.panX, mood.panY, reducedMotion]);

  if (!showField) return <StaticGlow color={staticColor} />;

  return (
    <div className="fixed -z-10 inset-0 pointer-events-none" data-testid="solutions-field-canvas">
      <SolutionsFieldScene
        onContextLost={() => setShowField(false)}
        onReady={(material) => {
          materialRef.current = material;
          material.uniforms.uColor.value.set(mood.color);
          material.uniforms.uColorDark.value.set(mood.colorDark);
          material.uniforms.uPan.value.set(mood.panX, mood.panY);
        }}
      />
    </div>
  );
}
