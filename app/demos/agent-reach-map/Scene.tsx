"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import DriftRig from "../../../components/three/DriftRig";
import { useTokens } from "../../../components/three/useTokens";
import { useReachMap } from "./reachMapContext";
import {
  buildAgentNodes,
  buildSystemNodes,
  buildEdges,
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

const CAMERA_FROM: [number, number, number] = [2.6, 6.8, 18.5];
const CAMERA_TO: [number, number, number] = [1.6, 1.0, 11.5];

const TOKEN_NAMES = {
  bgDarker: "--bg-darker",
  border: "--border",
  textMuted: "--text-muted",
  accent: "--accent",
  accentDark: "--accent-dark",
  warning: "--warning",
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
// instancedMesh use `e.instanceId` — verified in this build (not assumed):
// hover/click both correctly resolve the instance under OrbitControls with
// autoRotate active, confirmed via the canvas-click Playwright coverage in
// tests/agent-reach-map.spec.ts and by direct screenshot inspection of a
// hover state (see this task's verification notes).
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
