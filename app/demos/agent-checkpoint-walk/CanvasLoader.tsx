"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SceneLoader, { type SceneLoaderMode } from "../../../components/three/SceneLoader";
import Fallback from "./Fallback";
import Interaction from "./Interaction";
import { CheckpointWalkProvider } from "./checkpointWalkContext";

// ssr: false must be called from a client component in the App Router —
// this loader exists solely to isolate that call from the server-component
// page.tsx (which carries the route metadata), same pattern as
// agent-reach-map/CanvasLoader.tsx.
const AgentCheckpointWalkScene = dynamic(() => import("./Scene"), { ssr: false });

export default function AgentCheckpointWalkCanvasLoader() {
  const [mode, setMode] = useState<SceneLoaderMode>("loading");

  return (
    <CheckpointWalkProvider>
      <SceneLoader
        testIdPrefix="agent-checkpoint-walk-canvas"
        renderScene={(onContextLost) => <AgentCheckpointWalkScene onContextLost={onContextLost} />}
        fallback={<Fallback />}
        onModeChange={setMode}
      />
      {mode === "scene" && <Interaction />}
    </CheckpointWalkProvider>
  );
}
