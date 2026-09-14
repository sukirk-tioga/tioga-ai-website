"use client";

import { useEffect, useState } from "react";

// Captured hero for "The Boundary" — a real recording of the scene's own
// 5-shot cinematic camera sequence (BoundaryScene.tsx's forceCinematic
// path, captured via scripts/capture-boundary-hero.mjs), not a live-
// rendered WebGL default for every visitor (research doc §6). Same split
// as /showcase: a light passive hero up top, the heavier interactive
// canvas ("The scene," BoundaryCanvasLoader) further down.
//
// prefers-reduced-motion applies to this video, not just the canvas
// (docs/design/3d-design-standard.md §4.4 calls this out explicitly as an
// easy thing to miss) — reduced motion gets the poster as a plain static
// image, never an autoplaying <video>.
export default function BoundaryHero() {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const frameStyle = {
    border: "1px solid var(--border)",
    background: "var(--bg-card)",
    aspectRatio: "718 / 558",
  } as const;

  if (reducedMotion === null) {
    // Avoid a flash of the video before the reduced-motion check resolves —
    // render the static poster immediately, swap to video only once we know
    // motion is allowed.
    return (
      <div className="rounded-2xl overflow-hidden mb-4" style={frameStyle}>
        <img
          src="/demos/standing-watch/boundary-hero-poster.jpg"
          alt="A captured still of The Boundary 3D scene — nine real findings passing through one gate, eight landing fixed, one stopping at a wall"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className="rounded-2xl overflow-hidden mb-4" style={frameStyle}>
        <img
          src="/demos/standing-watch/boundary-hero-poster.jpg"
          alt="A captured still of The Boundary 3D scene — nine real findings passing through one gate, eight landing fixed, one stopping at a wall"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={frameStyle}>
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/demos/standing-watch/boundary-hero-poster.jpg"
        className="w-full h-full object-cover"
        aria-label="A captured recording of The Boundary 3D scene's cinematic camera sequence — nine real findings passing through one gate, eight landing fixed, one stopping at a wall"
      >
        <source src="/demos/standing-watch/boundary-hero.webm" type="video/webm" />
        <source src="/demos/standing-watch/boundary-hero.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
