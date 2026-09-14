"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SceneLoader, { type SceneLoaderMode } from "../../../components/three/SceneLoader";
import BoundaryFallback from "./BoundaryFallback";
import BoundaryInteraction from "./BoundaryInteraction";

// ssr: false must be called from a client component in the App Router —
// this loader exists solely to isolate that call from the server-component
// page.tsx (which carries the route metadata), same pattern as
// app/showcase/ShowcaseCanvasLoader.tsx.
const BoundaryScene = dynamic(() => import("./BoundaryScene"), { ssr: false });

export default function BoundaryCanvasLoader() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [playSignal, setPlaySignal] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<SceneLoaderMode>("loading");
  // `?cinematic=1` forces the 5-shot intro to play — used only by
  // scripts/capture-boundary-hero.mjs to record the hero video. Ordinary
  // visitors never see this param and land straight on the rest pose.
  const [forceCinematic] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("cinematic") === "1"
  );

  return (
    <div>
      <SceneLoader
        testIdPrefix="boundary-canvas"
        height="560px"
        fallback={<BoundaryFallback />}
        onModeChange={setMode}
        renderScene={(onContextLost) => (
          <BoundaryScene
            onContextLost={onContextLost}
            playSignal={playSignal}
            onPlayStateChange={setIsPlaying}
            selectedIndex={selectedIndex}
            onArrive={(i) => setSelectedIndex(i)}
            forceCinematic={forceCinematic}
          />
        )}
      />
      <p className="text-xs mt-3" style={{ color: "var(--text-muted-3)" }}>
        Resting at the completed set — 8 of 9 findings landed and fixed, one stopped permanently at
        the wall. Press Replay below to watch all nine cross the gate.
      </p>
      <BoundaryInteraction
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        isPlaying={isPlaying}
        // Gated on mode === "scene", not just "not currently playing": a
        // click landing in the brief window before BoundaryScene's dynamic
        // import + WebGL context finish mounting would otherwise increment
        // playSignal before Pulses' effect exists to see the change, silently
        // losing the click (found via this scene's own Playwright coverage,
        // not by inspection — tests/standing-watch-boundary.spec.ts).
        canReplay={mode === "scene"}
        onReplay={() => setPlaySignal((n) => n + 1)}
      />
    </div>
  );
}
