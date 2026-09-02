"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ShowcaseFallback from "./ShowcaseFallback";
import { useReplayChime, useReplayChimeEnabled } from "./useReplayChime";

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
  // 2026-08-15: the scene defaults to rest (every particle already landed)
  // instead of an always-running ambient loop — see ShowcaseScene.tsx for
  // why. This button is the only way to trigger the real, compressed
  // Jul 17-25 replay; playSignal increments on each click, isPlaying tracks
  // the scene's own play/pause edges so the button can't be double-clicked
  // into a second overlapping playthrough.
  const [playSignal, setPlaySignal] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // Phase 8: default-off, explicit opt-in, persisted -- see
  // useReplayChime.ts's header for why this stays defensive even though
  // Sukir overrode the plan's own "hold until seen by prospects" note.
  const [audioEnabled, setAudioEnabled] = useReplayChimeEnabled();
  const playTick = useReplayChime(audioEnabled);

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
    <div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", height: "560px" }}
        data-testid="showcase-canvas"
      >
        <ShowcaseScene
          onContextLost={() => setMode("fallback")}
          playSignal={playSignal}
          onPlayStateChange={setIsPlaying}
          onGateCross={playTick}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs" style={{ color: "var(--text-muted-3)" }}>
          Resting at the completed ledger — press Replay to watch the real Jul 17–25 sequence.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            aria-pressed={audioEnabled}
            data-testid="showcase-audio-toggle"
            title={audioEnabled ? "Sound on — each replay pulse plays a tick pitched by its real token count" : "Sound off"}
            className="shrink-0 text-xs font-mono px-3 py-1.5 rounded-full transition-colors"
            style={
              audioEnabled
                ? { color: "var(--accent)", background: "#C8340615", border: "1px solid #C8340630" }
                : { color: "var(--text-muted-3)", background: "var(--bg-dark)", border: "1px solid var(--border)" }
            }
          >
            {audioEnabled ? "🔊 Sound on" : "🔈 Sound off"}
          </button>
          <button
            type="button"
            onClick={() => setPlaySignal((n) => n + 1)}
            disabled={isPlaying}
            data-testid="showcase-replay-button"
            className="shrink-0 text-xs font-mono px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            style={{ color: "var(--accent)", background: "#C8340615", border: "1px solid #C8340630" }}
          >
            {isPlaying ? "Replaying…" : "▶ Replay Jul 17–25"}
          </button>
        </div>
      </div>
    </div>
  );
}
