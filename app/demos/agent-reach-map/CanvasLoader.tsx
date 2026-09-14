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
      <SceneLoader
        testIdPrefix="agent-reach-map-canvas"
        renderScene={(onContextLost) => <AgentReachMapScene onContextLost={onContextLost} />}
        fallback={<Fallback />}
        onModeChange={setMode}
      />
      {mode === "scene" && <Interaction />}
    </ReachMapProvider>
  );
}
