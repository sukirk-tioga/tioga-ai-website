"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import DriftRig from "../../../components/three/DriftRig";
import { useTokens } from "../../../components/three/useTokens";
import { useCheckpointWalk, type WalkPhase } from "./checkpointWalkContext";
import {
  agentTilePosition,
  systemNodePosition,
  GATE_POSITION,
  REPLAY_AGENT_POSITION,
  REPLAY_SYSTEM_POSITION,
  findAgent,
  agentWrites,
  WALK_LEG_SECONDS,
  GATE_CROSS_WINDOW,
  REPLAY_START_OFFSETS,
  REPLAY_TRAVEL_LEG_SECONDS,
  REPLAY_APPROVED_PAUSE_SECONDS,
  REPLAY_TOTAL_SECONDS,
} from "./checkpointLayout";
import { DISPOSITIONS } from "../../../lib/agent-register";

// The Checkpoint Walk — Concept B ("what happens when this crosses the
// gate?"), reusing app/showcase's Gate checkpoint metaphor (halo + scan
// ring, duplicated here rather than extracted — ShowcaseScene.tsx's Gate
// isn't exported, and this page's out-of-scope note explicitly prefers
// duplicating a few lines over risking a regression on the shipped
// /showcase route). Driven entirely by lib/agent-register.ts's real
// per-agent write edges and DISPOSITIONS — no composite/illustrative data,
// per this task's deliberate deviation from the original Concept B spec
// (research/2026-09-13-interactive-3d-offer-pilot-governance-framework.md
// §2.2, §8 decision #3).
//
// Colors are read once from CSS custom properties via useTokens (repo
// convention, docs/design/3d-design-standard.md §5) — zero hex literals in
// this file.

const CAMERA_FROM: [number, number, number] = [2.4, 5.4, 15.5];
const CAMERA_TO: [number, number, number] = [1.2, 1.4, 10.5];

const TOKEN_NAMES = {
  // Not --bg-darker: see agent-reach-map/Scene.tsx's own comment on this
  // exact gotcha (the 2026-09-02 light-theme redesign repointed
  // --bg-dark/--bg-darker to a light paper palette while keeping their old,
  // now-misleading names). --bg-solutions-field (#05070C) is the sanctioned
  // true-dark WebGL surface token.
  bgDarker: "--bg-solutions-field",
  border: "--border",
  textMuted: "--text-muted",
  accent: "--accent",
  accentDark: "--accent-dark",
  warning: "--warning",
} as const;

export type SceneTokens = { [K in keyof typeof TOKEN_NAMES]: string };

// --- The Gate --------------------------------------------------------
//
// Same checkpoint idiom as ShowcaseScene.tsx's Gate and agent-reach-map's
// hero-system treatment: a breathing halo + a slowly rotating scan ring,
// both decorative chrome tied to no real value (3d-design-standard.md
// §3.1's "honest ambient motion" test) — the two independent, differently-
// perioded motion sources that keep the rest state visibly alive even when
// no walk is in progress. `activity` (0..1) is driven by real pulse-
// crossing events from WalkPulse/ReplayPulses, same envelope-follower idea
// as ShowcaseScene.tsx's `gateActivity`/`displayedActivity`.
function Gate({ tokens, activity }: { tokens: SceneTokens; activity: React.MutableRefObject<number> }) {
  const frameMaterials = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const haloMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const scanRingRef = useRef<THREE.Mesh>(null);
  const scanMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const glassPaneRef = useRef<THREE.Mesh>(null);
  const displayed = useRef(0);

  useFrame(({ clock }, delta) => {
    const target = activity.current;
    const rate = target > displayed.current ? 14 : 3.2;
    displayed.current += (target - displayed.current) * Math.min(delta * rate, 1);
    const boost = displayed.current * 1.3;

    const breathe = 0.55 + 0.2 * Math.sin(clock.elapsedTime * 0.7);
    frameMaterials.current.forEach((mat) => {
      if (mat) mat.emissiveIntensity = breathe + boost;
    });
    if (haloMatRef.current) haloMatRef.current.opacity = 0.16 + displayed.current * 0.3;
    if (scanRingRef.current) scanRingRef.current.rotation.z = clock.elapsedTime * 0.9;
    if (scanMatRef.current) scanMatRef.current.opacity = 0.35 + 0.25 * Math.sin(clock.elapsedTime * 1.1);
    if (glassPaneRef.current) {
      // Same transform-level breathing pulse as ShowcaseScene.tsx's glass
      // pane -- MeshTransmissionMaterial has no emissive/opacity uniform to
      // drive the way the old flat disc did, so the "alive" signal moves to
      // scale instead, still driven by the same real `activity` ref.
      const s = 1 + 0.015 * Math.sin(clock.elapsedTime * 0.9) + displayed.current * 0.06;
      glassPaneRef.current.scale.setScalar(s);
    }
  });

  const frameWidth = 1.0;
  const frameHeight = 2.6;
  const bar = 0.09;

  return (
    <group position={GATE_POSITION}>
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[1.5, 40]} />
        <meshBasicMaterial
          ref={haloMatRef}
          color={tokens.accent}
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Glass portal pane -- added 2026-09-14, the one piece ShowcaseScene's
          Gate has that this duplicate never got (2026-09-14 blind critique:
          "the three.js-starter look," no material/lighting/depth). Real
          refraction/iridescence via drei's MeshTransmissionMaterial, same
          settings as ShowcaseScene.tsx's own gate -- renders whatever's
          actually behind it (the walk pulse / replay pulses) with visible
          bend as it crosses, instead of passing behind a flat glow. Pure
          chrome, no data claim, same honesty framing as the halo/scan ring
          it sits alongside. Radius kept at Showcase's own 0.62 rather than
          scaled to this gate's taller frameHeight (2.6 vs Showcase's 1.7) --
          verified live this still reads correctly inside the taller frame,
          not stretched or too small.*/}
      <mesh ref={glassPaneRef} position={[0, 0, -0.02]}>
        <circleGeometry args={[0.62, 48]} />
        <MeshTransmissionMaterial
          color={tokens.accent}
          roughness={0}
          transmission={1}
          thickness={2}
          ior={1.4}
          chromaticAberration={0.04}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 400]}
          distortion={0.15}
          distortionScale={0.3}
          temporalDistortion={0.08}
          backside
        />
      </mesh>
      <mesh ref={scanRingRef} position={[0, 0, -0.01]}>
        <ringGeometry args={[0.68, 0.74, 6, 1, 0, Math.PI * 1.3]} />
        <meshBasicMaterial
          ref={scanMatRef}
          color={tokens.accent}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {[
        { pos: [-frameWidth / 2, 0, 0], size: [bar, frameHeight, bar] },
        { pos: [frameWidth / 2, 0, 0], size: [bar, frameHeight, bar] },
        { pos: [0, frameHeight / 2, 0], size: [frameWidth, bar, bar] },
        { pos: [0, -frameHeight / 2, 0], size: [frameWidth, bar, bar] },
      ].map((piece, i) => (
        <mesh key={i} position={piece.pos as [number, number, number]}>
          <boxGeometry args={piece.size as [number, number, number]} />
          <meshStandardMaterial
            ref={(m) => {
              frameMaterials.current[i] = m;
            }}
            color={tokens.accentDark}
            emissive={tokens.accent}
            emissiveIntensity={0.55}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function AgentTile({ position, tokens }: { position: [number, number, number]; tokens: SceneTokens }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.5, 0.5, 0.3]} />
      <meshStandardMaterial color={tokens.border} emissive={tokens.textMuted} emissiveIntensity={0.35} roughness={0.5} />
    </mesh>
  );
}

function SystemNode({
  position,
  tokens,
  dim,
}: {
  position: [number, number, number];
  tokens: SceneTokens;
  dim?: boolean;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.28, 20, 20]} />
      <meshStandardMaterial
        color={tokens.accentDark}
        emissive={tokens.accentDark}
        emissiveIntensity={dim ? 0.15 : 0.32}
        roughness={0.35}
      />
    </mesh>
  );
}

// Phase -> where along the [0,1] agent->gate->system journey the pulse
// currently sits, and whether it's actually visible. Pure function of
// (phase, elapsed-since-phase-start) so Scene's useFrame stays a thin
// dispatcher over this table instead of a pile of inline branches.
function pulsePhaseU(phase: WalkPhase, elapsed: number): { u: number; visible: boolean } {
  switch (phase) {
    case "crossing":
      return { u: THREE.MathUtils.clamp(elapsed / (WALK_LEG_SECONDS * 2), 0, 1), visible: true };
    case "to-gate":
      return { u: 0.5 * THREE.MathUtils.clamp(elapsed / WALK_LEG_SECONDS, 0, 1), visible: true };
    case "paused-at-gate":
      return { u: 0.5, visible: true };
    case "to-system":
      return { u: 0.5 + 0.5 * THREE.MathUtils.clamp(elapsed / WALK_LEG_SECONDS, 0, 1), visible: true };
    case "returning":
      return { u: 0.5 - 0.5 * THREE.MathUtils.clamp(elapsed / WALK_LEG_SECONDS, 0, 1), visible: true };
    case "arrived":
      return { u: 1, visible: true };
    case "returned":
      return { u: 0, visible: true };
    case "idle":
    default:
      return { u: 0, visible: false };
  }
}

// The interactive walk pulse — the currently-selected agent's currently-
// selected write edge only (one pulse, one lane at a time). Drives the
// shared Gate's `activity` ref while the pulse is inside GATE_CROSS_WINDOW
// of the midpoint, and calls back into context exactly once per phase
// boundary (guarded by `firedRef`, same one-shot-latch idiom as
// ShowcaseScene.tsx's `firedThisPlay`).
function WalkPulse({ tokens, gateActivity }: { tokens: SceneTokens; gateActivity: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const { clock } = useThree();
  const {
    selectedAgentId,
    selectedWriteIndex,
    walkPhase,
    arriveAtGate,
    completeCrossing,
    completeArrival,
    completeReturn,
  } = useCheckpointWalk();

  const phaseStart = useRef(clock.elapsedTime);
  const firedRef = useRef(false);
  const lastPhase = useRef<WalkPhase>(walkPhase);

  useEffect(() => {
    if (lastPhase.current !== walkPhase) {
      phaseStart.current = clock.elapsedTime;
      firedRef.current = false;
      lastPhase.current = walkPhase;
    }
  }, [walkPhase, clock]);

  const agent = selectedAgentId ? findAgent(selectedAgentId) : undefined;
  const write = agent && selectedWriteIndex !== null ? agent.writes[selectedWriteIndex] : undefined;
  const totalWrites = agent?.writes.length ?? 1;

  const curve = useMemo(() => {
    if (selectedWriteIndex === null) return null;
    const a = agentTilePosition(selectedWriteIndex, totalWrites);
    const s = systemNodePosition(selectedWriteIndex, totalWrites);
    return new THREE.CatmullRomCurve3([new THREE.Vector3(...a), new THREE.Vector3(...GATE_POSITION), new THREE.Vector3(...s)]);
  }, [selectedWriteIndex, totalWrites]);

  useFrame(() => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    if (!write || !curve) {
      mesh.visible = false;
      return;
    }

    const elapsed = clock.elapsedTime - phaseStart.current;
    const { u, visible } = pulsePhaseU(walkPhase, elapsed);
    mesh.visible = visible;
    if (!visible) return;

    const point = curve.getPointAt(THREE.MathUtils.clamp(u, 0, 1));
    mesh.position.copy(point);

    const crossingGate = Math.abs(u - 0.5) < GATE_CROSS_WINDOW;
    gateActivity.current = Math.max(gateActivity.current, crossingGate ? 1 : 0);

    const tierColor = write.tier === "agent-owned" ? tokens.accent : tokens.warning;
    mat.color.set(tierColor);
    mat.emissive.set(tierColor);
    mat.emissiveIntensity = crossingGate ? 1.2 : 0.75;

    if (firedRef.current) return;
    if (walkPhase === "crossing" && elapsed >= WALK_LEG_SECONDS * 2) {
      firedRef.current = true;
      completeCrossing();
    } else if (walkPhase === "to-gate" && elapsed >= WALK_LEG_SECONDS) {
      firedRef.current = true;
      arriveAtGate();
    } else if (walkPhase === "to-system" && elapsed >= WALK_LEG_SECONDS) {
      firedRef.current = true;
      completeArrival();
    } else if (walkPhase === "returning" && elapsed >= WALK_LEG_SECONDS) {
      firedRef.current = true;
      completeReturn();
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.12, 14, 14]} />
      <meshStandardMaterial ref={matRef} emissiveIntensity={0.7} roughness={0.35} />
    </mesh>
  );
}

// One instanced sphere per real DISPOSITIONS row, staggered by
// REPLAY_START_OFFSETS — same shape as ShowcaseScene.tsx's Pulses
// component (curve.getPointAt(phase), timed by real start offsets, hidden
// via scale 0 unless actively in transit). auto-implemented rows cross the
// full lane in one continuous sweep; approved rows pause briefly at the
// gate (scripted, not interactive — it's playback of history, per the task
// spec) before continuing.
function ReplayPulses({ tokens, gateActivity }: { tokens: SceneTokens; gateActivity: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { clock } = useThree();
  const { replaySeq, replayRunning, onReplayEventLanded, completeReplay } = useCheckpointWalk();

  const playStart = useRef(0);
  const lastSeq = useRef(replaySeq);
  const landedRef = useRef<boolean[]>(new Array(DISPOSITIONS.length).fill(false));
  const doneRef = useRef(false);

  useEffect(() => {
    if (replaySeq !== lastSeq.current) {
      lastSeq.current = replaySeq;
      playStart.current = clock.elapsedTime;
      landedRef.current = new Array(DISPOSITIONS.length).fill(false);
      doneRef.current = false;
    }
  }, [replaySeq, clock]);

  const accentColor = useMemo(() => new THREE.Color(tokens.accent), [tokens.accent]);
  const warningColor = useMemo(() => new THREE.Color(tokens.warning), [tokens.warning]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || !replayRunning) {
      if (mesh) {
        DISPOSITIONS.forEach((_, i) => {
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
      }
      return;
    }

    const elapsedSincePlay = clock.elapsedTime - playStart.current;
    let anyCrossing = false;

    DISPOSITIONS.forEach((event, i) => {
      const startOffset = REPLAY_START_OFFSETS[i];
      const local = elapsedSincePlay - startOffset;
      const auto = event.disposition === "auto-implemented";
      const leg = REPLAY_TRAVEL_LEG_SECONDS;
      const pause = auto ? 0 : REPLAY_APPROVED_PAUSE_SECONDS;
      const total = leg * 2 + pause;

      let visible = false;
      let u = 0;
      if (local >= 0 && local <= total) {
        visible = true;
        if (local <= leg) {
          u = 0.5 * (local / leg);
        } else if (local <= leg + pause) {
          u = 0.5;
        } else {
          u = 0.5 + 0.5 * ((local - leg - pause) / leg);
        }
      }

      if (visible) {
        const a = new THREE.Vector3(...REPLAY_AGENT_POSITION);
        const g = new THREE.Vector3(...GATE_POSITION);
        const s = new THREE.Vector3(...REPLAY_SYSTEM_POSITION);
        const curve = new THREE.CatmullRomCurve3([a, g, s]);
        const point = curve.getPointAt(THREE.MathUtils.clamp(u, 0, 1));
        dummy.position.copy(point);
        dummy.scale.setScalar(0.1);
        if (Math.abs(u - 0.5) < GATE_CROSS_WINDOW) anyCrossing = true;
        mesh.setColorAt(i, auto ? accentColor : warningColor);
      } else {
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      if (local >= total && !landedRef.current[i]) {
        landedRef.current[i] = true;
        onReplayEventLanded(event);
      }
    });

    if (anyCrossing) gateActivity.current = Math.max(gateActivity.current, 1);

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    if (!doneRef.current && elapsedSincePlay > REPLAY_TOTAL_SECONDS + 0.3) {
      doneRef.current = true;
      completeReplay();
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DISPOSITIONS.length]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial emissive={tokens.accent} emissiveIntensity={0.7} roughness={0.35} />
    </instancedMesh>
  );
}

export default function AgentCheckpointWalkScene({ onContextLost }: { onContextLost: () => void }) {
  const tokens = useTokens(TOKEN_NAMES);
  const [isMobile, setIsMobile] = useState(false);
  const gateActivity = useRef(0);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const { selectedAgentId, selectedWriteIndex } = useCheckpointWalk();
  const agent = selectedAgentId ? findAgent(selectedAgentId) : undefined;
  const totalWrites = agent?.writes.length ?? 0;
  const lanes = agent ? agentWrites(agent) : [];
  const activeWrite = selectedWriteIndex !== null ? agent?.writes[selectedWriteIndex] : undefined;
  const activeIsHumanOwned = activeWrite?.tier === "human-owned";

  if (!tokens) return null;

  return (
    <Canvas
      camera={{ position: CAMERA_FROM, fov: 42 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            onContextLost();
          },
          { once: true }
        );
      }}
    >
      <color attach="background" args={[tokens.bgDarker]} />
      <fog attach="fog" args={[tokens.bgDarker, 11, 28]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[-6, 6.5, 8.5]} intensity={2.4} color={tokens.accent} decay={1.4} />
      <pointLight position={[6, -1, -7]} intensity={0.4} color="white" decay={1.6} />
      <pointLight position={[0, 1.5, 6]} intensity={0.4} decay={1.8} />

      <Gate tokens={tokens} activity={gateActivity} />

      {/* Interactive lane(s) — every write edge of the currently-selected
          agent renders as a static tile/system pair, dimmed on the one
          human-owned edge (task spec: no pulse, no path for it), so
          selecting a different write doesn't move geometry the visitor
          just learned to read. */}
      {lanes.map(({ writeIndex }) => {
        const isHumanOwned = agent!.writes[writeIndex].tier === "human-owned";
        return (
          <group key={writeIndex}>
            <AgentTile position={agentTilePosition(writeIndex, totalWrites)} tokens={tokens} />
            {!isHumanOwned && (
              <SystemNode position={systemNodePosition(writeIndex, totalWrites)} tokens={tokens} />
            )}
          </group>
        );
      })}
      {!activeIsHumanOwned && <WalkPulse tokens={tokens} gateActivity={gateActivity} />}

      {/* Replay lane */}
      <AgentTile position={REPLAY_AGENT_POSITION} tokens={tokens} />
      <SystemNode position={REPLAY_SYSTEM_POSITION} tokens={tokens} dim />
      <ReplayPulses tokens={tokens} gateActivity={gateActivity} />

      <DriftRig
        cameraFrom={CAMERA_FROM}
        cameraTo={CAMERA_TO}
        minAzimuthAngle={-0.5}
        maxAzimuthAngle={0.35}
        enableRotate={!isMobile}
      />
    </Canvas>
  );
}
