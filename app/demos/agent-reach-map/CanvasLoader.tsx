"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SceneLoader, { type SceneLoaderMode } from "../../../components/three/SceneLoader";
import Fallback from "./Fallback";
import Interaction from "./Interaction";
import { ReachMapProvider } from "./reachMapContext";

// ssr: false must be called from a client component in the App Router —
// this loader exists solely to isolate that call from the server-component
// page.tsx (which carries the route metadata), same pattern as
// ShowcaseCanvasLoader.tsx.
const AgentReachMapScene = dynamic(() => import("./Scene"), { ssr: false });

// Wires Scene + Interaction + Fallback together on top of the generic
// components/three/SceneLoader.tsx: the DOM agent list/detail panel
// (Interaction.tsx) only makes sense alongside a mounted canvas to bridge
// into, so it renders only in "scene" mode — the no-WebGL/reduced-motion
// Fallback table is already a complete, self-sufficient page on its own.
export default function AgentReachMapCanvasLoader() {
  const [mode, setMode] = useState<SceneLoaderMode>("loading");

  return (
    <ReachMapProvider>
      <div style={{ position: "relative" }}>
        <SceneLoader
          testIdPrefix="agent-reach-map-canvas"
          renderScene={(onContextLost) => <AgentReachMapScene onContextLost={onContextLost} />}
          fallback={<Fallback />}
          onModeChange={setMode}
        />
        {/* In-canvas legend -- 2026-09-14 blind critique: "nothing
            currently tells a non-interacting visitor what a node/edge is."
            The DOM agent list/detail panel below (Interaction.tsx) already
            explains this in depth, but that's below the fold and requires
            scrolling/clicking first -- this is the one-glance version for
            someone who never interacts at all. Absolutely positioned over
            the canvas corner, not inside the R3F scene itself (Scene.tsx
            stays a pure Canvas, matching its existing separation from this
            file's own DOM-wrapper responsibilities). Only shown once the
            real scene has mounted -- the loading/fallback states already
            explain themselves without this. */}
        {mode === "scene" && (
          <div
            className="absolute bottom-3 left-3 rounded-lg px-3 py-2 text-[10px] leading-relaxed pointer-events-none"
            style={{ background: "#05070Ccc", border: "1px solid var(--border)", color: "var(--text-muted-on-dark)" }}
          >
            <span style={{ color: "var(--text-on-dark)" }}>Left:</span> 29 scheduled agents ·{" "}
            <span style={{ color: "var(--text-on-dark)" }}>Right:</span> systems they read/write ·{" "}
            <span style={{ color: "var(--text-on-dark)" }}>Lines:</span> authorization tier
          </div>
        )}
      </div>
      {mode === "scene" && <Interaction />}
    </ReachMapProvider>
  );
}
