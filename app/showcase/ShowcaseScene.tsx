"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { LEDGER, TOTAL_SPEND, BUDGET_CAP, BACKEND_ROUTES } from "../../lib/governance-ledger";

// The Oversight Plane — Phase 1 MVP.
//
// Three stacked planes (request / policy / execution), an InstancedMesh of
// exactly LEDGER.length (17) particles — one per real ledger row, no
// decorative filler — flowing top to bottom. Free-pool rows bypass the
// budget aperture in a side lane; paid rows pass through its center. On
// landing, each particle converges toward the execution node matching its
// real `served` backend. No approval-gate mechanic (see plan §1 correction
// — the data has no write/read-path field, so nothing here should look
// like one).
//
// Colors are read from CSS custom properties at runtime via
// getComputedStyle — this repo forbids hex literals in TSX, and Three.js
// needs numeric/string colors, so this hook (plan §4's sanctioned pattern)
// is the bridge. No hex literal ever appears in this file. Translucency
// uses THREE.js material `opacity`, not embedded alpha-hex, since
// THREE.Color itself has no alpha channel.
function readToken(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || "white";
}

interface Tokens {
  bgDarker: string;
  border: string;
  accent: string;
  accentDark: string;
  success: string;
}

const PLANE_Y = { request: 3, policy: 0, execution: -3 } as const;
const CYCLE_SECONDS = 7;

// Deterministic per-row lane assignment — free-pool rows bypass the
// aperture in a side lane (never crossing x=0 on the policy plane); paid
// rows pass straight through its center. This is what makes the bypass
// visible: it's a real property of `pool`, not a random scatter.
function laneX(index: number, pool: "free" | "paid"): number {
  if (pool === "paid") return 0;
  const side = index % 2 === 0 ? -1 : 1;
  const jitter = ((index % 3) - 1) * 0.25;
  return side * 3.1 + jitter;
}

// Execution-node x position for a row, derived from BACKEND_ROUTES (the
// distinct `served` values that actually appear in the data) — not
// hand-placed. 3 backends -> 3 evenly spaced nodes.
function nodeX(servedIndex: number, total: number): number {
  const spread = 2.6;
  if (total <= 1) return 0;
  return -spread + (spread * 2 * servedIndex) / (total - 1);
}

function Planes({ tokens }: { tokens: Tokens }) {
  const fillColor = tokens.accent;
  const wireColor = tokens.border;

  const planeProps = { args: [9, 5.4] as [number, number] };

  return (
    <>
      {Object.entries(PLANE_Y).map(([name, y]) => (
        <group key={name} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <planeGeometry {...planeProps} />
            <meshBasicMaterial color={fillColor} transparent opacity={0.045} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <planeGeometry {...planeProps} />
            <meshBasicMaterial color={wireColor} wireframe transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// The budget aperture — GOVERN made physical. It lights on the policy
// plane itself (a slow independent pulse), not on any particle's
// completion: no row in the ledger carries a GOVERN tag, matching how
// /demos/governance-ledger already treats GOVERN as the policy layer
// (`policy: budget.json`), not a per-call attribute.
function BudgetAperture({ tokens }: { tokens: Tokens }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const meterRef = useRef<THREE.Mesh>(null);
  const ringMaterial = useRef<THREE.MeshStandardMaterial>(null);

  // Real ratio: $0.000753 / $30.00 ~= 0.000025 -- genuinely, deliberately
  // almost invisible (that's the point the plan makes: "the meter barely
  // moves"). A small render-floor keeps the bar from being literally zero
  // pixels tall so it reads as a meter at all; the exact number is spelled
  // out in the DOM legend/provenance strip, not fabricated by this floor.
  const ratio = TOTAL_SPEND / BUDGET_CAP;
  const meterHeight = Math.max(ratio * 2.2, 0.025);

  useFrame(({ clock }) => {
    const pulse = 0.35 + 0.25 * Math.sin(clock.elapsedTime * 0.6);
    if (ringMaterial.current) ringMaterial.current.emissiveIntensity = pulse;
    if (ringRef.current) ringRef.current.rotation.z = clock.elapsedTime * 0.05;
  });

  return (
    <group position={[0, PLANE_Y.policy, 0]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.92, 48]} />
        <meshStandardMaterial
          ref={ringMaterial}
          color={tokens.accentDark}
          emissive={tokens.accent}
          emissiveIntensity={0.35}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Spend meter — a thin bar rising from the aperture's base. */}
      <mesh ref={meterRef} position={[0, meterHeight / 2 - 0.4, 0]}>
        <boxGeometry args={[0.08, meterHeight, 0.08]} />
        <meshStandardMaterial color={tokens.accent} emissive={tokens.accent} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function ExecutionNodes({ tokens, heatRefsOut }: { tokens: Tokens; heatRefsOut: React.MutableRefObject<THREE.Mesh[]> }) {
  return (
    <group position={[0, PLANE_Y.execution, 0]}>
      {BACKEND_ROUTES.map((served, i) => (
        <mesh
          key={served}
          position={[nodeX(i, BACKEND_ROUTES.length), 0.15, 0]}
          ref={(m) => {
            if (m) heatRefsOut.current[i] = m;
          }}
        >
          <boxGeometry args={[0.5, 0.3, 0.5]} />
          <meshStandardMaterial color={tokens.border} emissive={tokens.success} emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function Particles({ tokens }: { tokens: Tokens }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const heatRefs = useRef<THREE.Mesh[]>([]);

  const poolColor = useMemo(
    () => ({
      free: new THREE.Color(tokens.accent),
      paid: new THREE.Color(tokens.accentDark),
      landed: new THREE.Color(tokens.success),
    }),
    [tokens]
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const rows = useMemo(
    () =>
      LEDGER.map((row, i) => ({
        row,
        lane: laneX(i, row.pool),
        node: nodeX(BACKEND_ROUTES.indexOf(row.served), BACKEND_ROUTES.length),
        phaseOffset: i / LEDGER.length,
      })),
    []
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const nodeHeat = new Array(BACKEND_ROUTES.length).fill(0);

    rows.forEach(({ row, lane, node, phaseOffset }, i) => {
      const phase = ((clock.elapsedTime / CYCLE_SECONDS + phaseOffset) % 1 + 1) % 1;

      const y = PLANE_Y.request - (PLANE_Y.request - PLANE_Y.execution) * phase;
      // First half of the trip: hold the lane position (bypass or center).
      // Second half: ease from the lane toward this row's real execution
      // node, matching the `served` backend it actually landed on.
      const x = phase < 0.5 ? lane : THREE.MathUtils.lerp(lane, node, (phase - 0.5) / 0.5);

      dummy.position.set(x, y, 0);
      const scale = row.pool === "paid" ? 0.11 : 0.08;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const nearLanding = phase > 0.86;
      const color = nearLanding ? poolColor.landed : poolColor[row.pool];
      mesh.setColorAt(i, color);

      if (nearLanding) {
        const heat = 1 - (1 - phase) / 0.14;
        const nodeIndex = BACKEND_ROUTES.indexOf(row.served);
        nodeHeat[nodeIndex] = Math.max(nodeHeat[nodeIndex], heat);
      }
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    heatRefs.current.forEach((nodeMesh, i) => {
      const mat = nodeMesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.15 + (nodeHeat[i] ?? 0) * 1.6;
    });
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, LEDGER.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial />
      </instancedMesh>
      <ExecutionNodes tokens={tokens} heatRefsOut={heatRefs} />
    </>
  );
}

// Constrained camera: damped orbit inside a limited azimuth/polar range
// plus slow auto-drift. No free-fly, no zoom. Mobile gets a fixed 3/4
// view with drag disabled (touch-drag on a small canvas fights page
// scroll) but keeps the same slow auto-drift.
function Rig({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.4, 11);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      enableRotate={!isMobile}
      autoRotate
      autoRotateSpeed={0.35}
      minPolarAngle={Math.PI / 2 - 0.32}
      maxPolarAngle={Math.PI / 2 + 0.1}
      minAzimuthAngle={-0.55}
      maxAzimuthAngle={0.55}
      dampingFactor={0.08}
      enableDamping
    />
  );
}

export default function ShowcaseScene({ onContextLost }: { onContextLost: () => void }) {
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setTokens({
      bgDarker: readToken("--bg-darker"),
      border: readToken("--border"),
      accent: readToken("--accent"),
      accentDark: readToken("--accent-dark"),
      success: readToken("--success"),
    });
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (!tokens) return null;

  return (
    <Canvas
      camera={{ position: [0, 1.4, 11], fov: 42 }}
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
      <ambientLight intensity={0.55} />
      <pointLight position={[6, 6, 6]} intensity={1.1} />
      <pointLight position={[-6, -3, 4]} intensity={0.4} color={tokens.accent} />
      <Planes tokens={tokens} />
      <BudgetAperture tokens={tokens} />
      <Particles tokens={tokens} />
      <Rig isMobile={isMobile} />
    </Canvas>
  );
}
