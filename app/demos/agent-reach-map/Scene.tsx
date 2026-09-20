"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import DriftRig from "../../../components/three/DriftRig";
import { useTokens } from "../../../components/three/useTokens";
import { useReachMap } from "./reachMapContext";
import {
  buildAgentNodes,
  buildSystemNodes,
  buildEdges,
  computeNodeBoundingSphere,
  type AgentNode,
  type SystemNode,
  type EdgeLayout,
} from "./registerLayout";
import type { SystemId, Tier } from "../../../lib/agent-register";

// The Reach Map — Tioga's own 29 scheduled agents (left column, one
// instanced sphere each) authorized against the 12 real systems of record
// they can read or write (right column), edges colored by real
// authorization tier. Two-column bipartite layout (registerLayout.ts),
// NOT the three-column tiles->gate->pools corridor /showcase uses — see
// that file's own header for why a different shape was chosen here.
//
// Colors are read once from CSS custom properties via useTokens/
// readCssToken (repo convention, docs/design/3d-design-standard.md §5) —
// zero hex literals in this file.

// Original hand-tuned direction/feel, kept as-is -- only the DISTANCE
// along these directions is now derived reactively per the real canvas
// aspect ratio (see FramedRig below), fixing the 2026-09-14 blind
// critique's "ambient camera drift regularly frames zero nodes/no hero"
// (confirmed live: at some azimuth angles within the drift range, the node
// columns rotated edge-on and vanished, leaving only the connecting edge
// tubes visible). Root cause: this constant's distance (|CAMERA_TO| ~=
// 11.65) was tuned to look right at ONE azimuth angle, but never verified
// against the actual node bounding sphere (radius ~6.4) -- 11.65 < 6.4 /
// sin(21 deg FOV-half) ~= 17.9, the minimum distance that guarantees every
// node stays in frame at every azimuth, not just the one this was
// eyeballed against.
const CAMERA_FROM_DIRECTION: [number, number, number] = [2.6, 6.8, 18.5];
const CAMERA_TO_DIRECTION: [number, number, number] = [1.6, 1.0, 11.5];
const FOV_DEGREES = 42;
const CAMERA_TO_ORIGINAL_DISTANCE = new THREE.Vector3(...CAMERA_TO_DIRECTION).length();
const CAMERA_FROM_TO_RATIO =
  new THREE.Vector3(...CAMERA_FROM_DIRECTION).length() / CAMERA_TO_ORIGINAL_DISTANCE;
// Covers node/edge radius and canvas letterboxing on top of the pure
// point-center bounding sphere -- not load-bearing for the core guarantee
// (that's the sin(halfFOV) term), just a margin so nodes don't sit flush
// against the frame edge.
const FRAMING_SAFETY_MARGIN = 1.15;
const NODE_BOUNDING_SPHERE = computeNodeBoundingSphere();

function safeCameraDistance(sphereRadius: number, aspect: number): number {
  const vFovHalf = THREE.MathUtils.degToRad(FOV_DEGREES) / 2;
  const hFovHalf = Math.atan(Math.tan(vFovHalf) * aspect);
  // Whichever axis is tighter (a narrow/portrait canvas is horizontally
  // constrained, not vertically) is the one that must contain the sphere.
  const limitingHalfAngle = Math.min(vFovHalf, hFovHalf);
  return (sphereRadius / Math.sin(limitingHalfAngle)) * FRAMING_SAFETY_MARGIN;
}

// Rendered inside <Canvas> (needs useThree for the live canvas aspect
// ratio) -- reactively derives camera distance and fog range from the real
// viewport instead of one static worst-case guess. A first pass used a
// fixed ASSUMED_WORST_CASE_ASPECT=0.6 (avoiding useThree entirely, out of
// caution) -- confirmed live that this over-corrected: at this demo's
// actual aspect (well above 0.6), it zoomed out far more than needed,
// leaving nodes as barely-visible specks. This version uses the real
// size.width/size.height, with a size.width===0 guard (R3F's measured
// canvas size can briefly be 0x0 before its ResizeObserver's first
// callback fires -- an earlier unguarded attempt produced NaN camera
// positions that never recovered) falling back to aspect=1 for that one
// frame, then recomputing correctly once real dimensions arrive. Also
// forgot the fog range needs to scale with camera distance too, the first
// time around -- caught live (fully black canvas, camera framing was
// correct but everything was fogged into invisibility) and fixed by
// deriving FOG_NEAR/FOG_FAR from the same distance here.
function FramedRig({ isMobile, bgToken }: { isMobile: boolean; bgToken: string }) {
  const size = useThree((state) => state.size);
  const aspect = size.width > 0 && size.height > 0 ? size.width / size.height : 1;
  const toDistance = safeCameraDistance(NODE_BOUNDING_SPHERE.radius, aspect);
  const fromDistance = toDistance * CAMERA_FROM_TO_RATIO;
  const cameraTo = useMemo(
    () =>
      new THREE.Vector3(...CAMERA_TO_DIRECTION)
        .normalize()
        .multiplyScalar(toDistance)
        .toArray() as [number, number, number],
    [toDistance]
  );
  const cameraFrom = useMemo(
    () =>
      new THREE.Vector3(...CAMERA_FROM_DIRECTION)
        .normalize()
        .multiplyScalar(fromDistance)
        .toArray() as [number, number, number],
    [fromDistance]
  );
  const fogNear = toDistance - NODE_BOUNDING_SPHERE.radius * 0.5;
  const fogFar = toDistance + NODE_BOUNDING_SPHERE.radius * 3;
  return (
    <>
      <fog attach="fog" args={[bgToken, fogNear, fogFar]} />
      <DriftRig
        cameraFrom={cameraFrom}
        cameraTo={cameraTo}
        minAzimuthAngle={-0.5}
        maxAzimuthAngle={0.35}
        enableRotate={!isMobile}
      />
    </>
  );
}

// Fallback camera position for the Canvas's initial (pre-mount) camera
// prop only -- DriftRig's intro lerp overrides this on the very first
// frame regardless, using FramedRig's freshly-computed cameraFrom, so this
// never needs to be exact. Aspect=1 matches FramedRig's own pre-measurement
// fallback.
const INITIAL_CAMERA_POSITION: [number, number, number] = new THREE.Vector3(
  ...CAMERA_FROM_DIRECTION
)
  .normalize()
  .multiplyScalar(safeCameraDistance(NODE_BOUNDING_SPHERE.radius, 1) * CAMERA_FROM_TO_RATIO)
  .toArray();

const TOKEN_NAMES = {
  // Not --bg-darker: the 2026-09-02 "audit-ledger" redesign (see
  // app/globals.css's :root comment) repointed --bg-dark/--bg-darker to a
  // light paper palette while keeping their old (now misleading) names —
  // "'dark' in a name no longer describes the value it holds." The one
  // sanctioned true-dark WebGL surface token left on this now-light site is
  // --bg-solutions-field (#05070C), already used by SolutionsFieldScene —
  // this scene's additive-glow/emissive hero-object language (3D standard
  // §5.1) needs a real dark backdrop to read at all, same reasoning.
  bgDarker: "--bg-solutions-field",
  border: "--border",
  textMuted: "--text-muted",
  accent: "--accent",
  accentDark: "--accent-dark",
  warning: "--scene-warning",
} as const;

export type SceneTokens = { [K in keyof typeof TOKEN_NAMES]: string };

const TIER_STYLE: Record<Tier, { radius: number; restOpacity: number; restIntensity: number }> = {
  "agent-owned": { radius: 0.032, restOpacity: 0.62, restIntensity: 0.55 },
  "human-supervised": { radius: 0.024, restOpacity: 0.5, restIntensity: 0.4 },
  // A thin, mostly-inert hairline — an advisory-only write (an emailed
  // alert), not a real mutation path.
  "human-owned": { radius: 0.011, restOpacity: 0.24, restIntensity: 0.16 },
};

// One instanced sphere per agent (left column). Pointer events on an
// instancedMesh use `e.instanceId` — this was flagged as a real hypothesis
// to verify, not assumed, and the first version genuinely did not work: a
// raw click/pointermove sweep across the whole node column produced zero
// R3F pointer events, even though rendering, plain (non-instanced) mesh
// picking (the system nodes below), and raw DOM pointer events on the
// canvas all worked fine. Root cause, confirmed by instrumenting the
// handlers directly: three r159+'s `InstancedMesh` needs its aggregate
// `boundingSphere` computed explicitly — `computeBoundingSphere()` below,
// right after `setMatrixAt`/`instanceMatrix.needsUpdate` — or raycasting
// silently misses every instance while still rendering correctly. Fixed
// and re-verified (see this task's verification notes: a direct canvas
// click at a computed node position now correctly selects it).
function NodeInstances({
  nodes,
  tokens,
  selectedAgentId,
  hoveredAgentId,
  onSelect,
  onHover,
}: {
  nodes: AgentNode[];
  tokens: SceneTokens;
  selectedAgentId: string | null;
  hoveredAgentId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const baseColor = useMemo(() => new THREE.Color(tokens.textMuted), [tokens.textMuted]);
  const accentColor = useMemo(() => new THREE.Color(tokens.accent), [tokens.accent]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    nodes.forEach((n, i) => {
      dummy.position.set(...n.position);
      dummy.scale.setScalar(0.16);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [nodes, dummy]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const anySelected = !!selectedAgentId;
    const breathe = 0.06 * Math.sin(clock.elapsedTime * 0.6);
    nodes.forEach((n, i) => {
      const isSelected = n.agent.id === selectedAgentId;
      const isHovered = n.agent.id === hoveredAgentId;
      let t = 0.32 + breathe;
      if (anySelected) t = isSelected ? 1 : 0.16;
      else if (isHovered) t = 0.85;
      const color = baseColor.clone().lerp(accentColor, THREE.MathUtils.clamp(t, 0, 1));
      mesh.setColorAt(i, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, nodes.length]}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (e.instanceId === undefined) return;
        const n = nodes[e.instanceId];
        if (n) onHover(n.agent.id);
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (e.instanceId === undefined) return;
        const n = nodes[e.instanceId];
        if (!n) return;
        onSelect(n.agent.id === selectedAgentId ? null : n.agent.id);
      }}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial emissive={tokens.accent} emissiveIntensity={0.5} roughness={0.4} />
    </instancedMesh>
  );
}

// One tube per real write edge (agent -> system), colored by real tier. An
// agent with two writes to the same system (check-automations ->
// PIPELINE_CODE, at two different tiers) renders as two separate tubes,
// never merged — registerLayout.ts's buildEdges() already keeps them
// distinct via writeIndex.
function EdgeTubes({
  edges,
  tokens,
  selectedAgentId,
  hoveredAgentId,
  unsupervisedOnly,
}: {
  edges: EdgeLayout[];
  tokens: SceneTokens;
  selectedAgentId: string | null;
  hoveredAgentId: string | null;
  unsupervisedOnly: boolean;
}) {
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const curves = useMemo(
    () =>
      edges.map(
        (e) =>
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(...e.agentPosition),
            new THREE.Vector3(...e.midPoint),
            new THREE.Vector3(...e.systemPosition),
          ])
      ),
    [edges]
  );
  // Staggered, non-synchronized shimmer phase per edge — same idiom as
  // Ribbons' phaseOffsets: honest ambient motion (material, not an event),
  // never a synchronized pulse that would read as live traffic.
  const phaseOffsets = useMemo(() => edges.map((_, i) => (i * 0.6180339887) % (Math.PI * 2)), [edges]);
  const tierColor = useMemo(
    () => ({
      "agent-owned": new THREE.Color(tokens.accent),
      "human-supervised": new THREE.Color(tokens.warning),
      "human-owned": new THREE.Color(tokens.border),
    }),
    [tokens]
  );

  useFrame(({ clock }) => {
    const activeAgent = hoveredAgentId ?? selectedAgentId;
    edges.forEach((edge, i) => {
      const mat = materials.current[i];
      if (!mat) return;
      const shimmer = 0.08 * Math.sin(clock.elapsedTime * 0.45 + phaseOffsets[i]);
      const rest = TIER_STYLE[edge.tier];

      let opacity: number;
      let intensity: number;
      if (unsupervisedOnly) {
        const isUnsupervised = edge.tier === "agent-owned";
        opacity = isUnsupervised ? 0.85 : 0.04;
        intensity = isUnsupervised ? 0.95 : 0.05;
      } else if (activeAgent) {
        const isActive = edge.agentId === activeAgent;
        opacity = isActive ? 0.95 : 0.12;
        intensity = isActive ? 1.1 : 0.12;
      } else {
        opacity = rest.restOpacity;
        intensity = rest.restIntensity;
      }
      mat.opacity = Math.max(opacity + shimmer, 0.02);
      mat.emissiveIntensity = Math.max(intensity + shimmer, 0.03);
    });
  });

  return (
    <>
      {edges.map((edge, i) => (
        <mesh key={`${edge.agentId}-${edge.systemId}-${edge.writeIndex}`}>
          <tubeGeometry args={[curves[i], 24, TIER_STYLE[edge.tier].radius, 6, false]} />
          <meshStandardMaterial
            ref={(m) => {
              materials.current[i] = m;
            }}
            color={tierColor[edge.tier]}
            emissive={tierColor[edge.tier]}
            emissiveIntensity={TIER_STYLE[edge.tier].restIntensity}
            transparent
            opacity={TIER_STYLE[edge.tier].restOpacity}
            roughness={0.5}
          />
        </mesh>
      ))}
    </>
  );
}

// The 12 systems of record (right column) as individual meshes — each
// needs distinct per-node behavior (hero treatment, hover/click), unlike
// the uniform agent instances. The hero system (highest blast radius,
// PIPELINE_CODE) carries the Gate's "always visibly moving" chrome idiom:
// a rotating scan ring plus a breathing halo, both decorative and tied to
// no real value — same honesty framing as ShowcaseScene.tsx's Gate.
function SystemNodes({
  nodes,
  tokens,
  hoveredSystemId,
  selectedSystemId,
  onHover,
  onSelect,
}: {
  nodes: SystemNode[];
  tokens: SceneTokens;
  hoveredSystemId: SystemId | null;
  selectedSystemId: SystemId | null;
  onHover: (id: SystemId | null) => void;
  onSelect: (id: SystemId | null) => void;
}) {
  const materials = useRef<Record<string, THREE.MeshStandardMaterial | null>>({});
  const scanRingRef = useRef<THREE.Mesh>(null);
  const scanMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const haloMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    nodes.forEach((n) => {
      const mat = materials.current[n.system.id];
      if (!mat) return;
      const isActive = n.system.id === hoveredSystemId || n.system.id === selectedSystemId;
      const breathe = n.isHero ? 0.55 + 0.2 * Math.sin(clock.elapsedTime * 0.7) : 0.22;
      mat.emissiveIntensity = breathe + (isActive ? 0.5 : 0);
    });
    if (scanRingRef.current) scanRingRef.current.rotation.z = clock.elapsedTime * 0.9;
    if (scanMatRef.current) scanMatRef.current.opacity = 0.35 + 0.25 * Math.sin(clock.elapsedTime * 1.1);
    if (haloMatRef.current) haloMatRef.current.opacity = 0.14 + 0.06 * Math.sin(clock.elapsedTime * 0.5);
  });

  return (
    <>
      {nodes.map((n) => (
        <group key={n.system.id} position={n.position}>
          <mesh
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              onHover(n.system.id);
            }}
            onPointerOut={() => onHover(null)}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onSelect(n.system.id === selectedSystemId ? null : n.system.id);
            }}
          >
            <sphereGeometry args={[n.radius, 24, 24]} />
            <meshStandardMaterial
              ref={(m) => {
                materials.current[n.system.id] = m;
              }}
              color={n.isHero ? tokens.accent : tokens.accentDark}
              emissive={n.isHero ? tokens.accent : tokens.accentDark}
              emissiveIntensity={0.3}
              roughness={0.35}
            />
          </mesh>
          {n.isHero && (
            <>
              <mesh position={[0, 0, -0.05]}>
                <circleGeometry args={[n.radius * 2.4, 32]} />
                <meshBasicMaterial
                  ref={haloMatRef}
                  color={tokens.accent}
                  transparent
                  opacity={0.16}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
              <mesh ref={scanRingRef} position={[0, 0, -0.02]}>
                <ringGeometry args={[n.radius * 1.3, n.radius * 1.45, 6, 1, 0, Math.PI * 1.3]} />
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
            </>
          )}
        </group>
      ))}
    </>
  );
}

export default function AgentReachMapScene({ onContextLost }: { onContextLost: () => void }) {
  const tokens = useTokens(TOKEN_NAMES);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const agentNodes = useMemo(() => buildAgentNodes(), []);
  const systemNodes = useMemo(() => buildSystemNodes(), []);
  const edges = useMemo(() => buildEdges(), []);

  const {
    selectedAgentId,
    hoveredAgentId,
    selectedSystemId,
    hoveredSystemId,
    unsupervisedOnly,
    selectAgent,
    hoverAgent,
    selectSystem,
    hoverSystem,
  } = useReachMap();

  if (!tokens) return null;

  return (
    <Canvas
      camera={{ position: INITIAL_CAMERA_POSITION, fov: FOV_DEGREES }}
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
      {/* Three-point lighting, same recipe as ShowcaseScene.tsx: ambient
          near-black, one hard key, one cool rim, one low fill. */}
      <ambientLight intensity={0.15} />
      <pointLight position={[-6, 6.5, 8.5]} intensity={2.4} color={tokens.accent} decay={1.4} />
      <pointLight position={[6, -1, -7]} intensity={0.4} color="white" decay={1.6} />
      <pointLight position={[0, 1.5, 6]} intensity={0.4} decay={1.8} />
      <EdgeTubes
        edges={edges}
        tokens={tokens}
        selectedAgentId={selectedAgentId}
        hoveredAgentId={hoveredAgentId}
        unsupervisedOnly={unsupervisedOnly}
      />
      <NodeInstances
        nodes={agentNodes}
        tokens={tokens}
        selectedAgentId={selectedAgentId}
        hoveredAgentId={hoveredAgentId}
        onSelect={selectAgent}
        onHover={hoverAgent}
      />
      <SystemNodes
        nodes={systemNodes}
        tokens={tokens}
        hoveredSystemId={hoveredSystemId}
        selectedSystemId={selectedSystemId}
        onHover={hoverSystem}
        onSelect={selectSystem}
      />
      <FramedRig isMobile={isMobile} bgToken={tokens.bgDarker} />
    </Canvas>
  );
}
