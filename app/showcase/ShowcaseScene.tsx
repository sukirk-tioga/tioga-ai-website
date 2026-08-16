"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  LEDGER,
  TOTAL_SPEND,
  BUDGET_CAP,
  BACKEND_ROUTES,
  REPLAY_START_OFFSETS,
  REPLAY_TRAVEL_DURATION,
  REPLAY_TOTAL_DURATION,
} from "../../lib/governance-ledger";

// The Oversight Plane — Phase 1 MVP, craft pass 2026-08-15.
//
// Three stacked planes (request / policy / execution), an InstancedMesh of
// exactly LEDGER.length (17) particles — one per real ledger row, no
// decorative filler. Free-pool rows bypass the budget aperture in a side
// lane; paid rows pass through its center. On landing, each particle
// converges toward the execution node matching its real `served` backend.
// No approval-gate mechanic (see plan §1 correction — the data has no
// write/read-path field, so nothing here should look like one).
//
// 2026-08-15 revision: replaced the original continuous 7-second ambient
// loop with a rest/replay model (Sukirk feedback: "looks generic," Fable
// 5's research flagged continuous ambient particle flow as reading like a
// cyber-threat-map — "pure eye candy... more cinema than science," the
// exact aesthetic Norse's viral (and now-defunct) attack map became known
// for). Default state: every particle sits at its real landed position —
// the ledger, already written, read as evidence rather than motion. A
// "Replay" control (see ShowcaseCanvasLoader) plays the real, compressed
// Jul 17-25 timeline once, using REPLAY_START_OFFSETS/REPLAY_TRAVEL_DURATION
// from lib/governance-ledger.ts (real inter-call gaps, not even spacing),
// then returns to rest. Nothing here is a synthetic loop pretending to be
// live activity.
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

// Scripted intro camera dolly (craft pass): eases from a wider, higher
// establishing shot down into the constrained 3/4 working view over
// INTRO_SECONDS, then hands off to OrbitControls (which mounts for the
// first time only once the intro finishes, so it captures its baseline
// spherical state from the final position — no fighting between a manual
// lerp and OrbitControls' own per-frame update in the same window).
const CAMERA_FROM: [number, number, number] = [0, 5.6, 15.4];
const CAMERA_TO: [number, number, number] = [0, 1.4, 11];
const INTRO_SECONDS = 1.8;

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

// Craft pass: fill planes moved from meshBasicMaterial (flat, unlit — reads
// as a colored square regardless of lighting) to meshStandardMaterial with
// a slight emissive base, so the two point lights actually create visible
// falloff and highlight across each plane's surface instead of a flat
// tint. Each plane also gets a faint emissive bias toward its role (warmer/
// brighter for request, neutral for policy, cooler for execution) — a
// static, honest visual cue (data still drives every particle/aperture/
// node value; this only shades the backdrop), not a new claim about the
// data itself.
// 2026-08-15: values roughly doubled — screenshot confirmed the original
// bias (0.02-0.05) plus 0.045 fill opacity made the planes nearly
// imperceptible against the dark background.
const PLANE_EMISSIVE_BIAS: Record<keyof typeof PLANE_Y, number> = {
  request: 0.11,
  policy: 0.08,
  execution: 0.05,
};

function Planes({ tokens }: { tokens: Tokens }) {
  const fillColor = tokens.accent;
  const wireColor = tokens.border;

  const planeProps = { args: [9, 5.4] as [number, number] };

  return (
    <>
      {(Object.entries(PLANE_Y) as [keyof typeof PLANE_Y, number][]).map(([name, y]) => (
        <group key={name} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <planeGeometry {...planeProps} />
            <meshStandardMaterial
              color={fillColor}
              emissive={fillColor}
              emissiveIntensity={PLANE_EMISSIVE_BIAS[name]}
              roughness={0.85}
              metalness={0.1}
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <planeGeometry {...planeProps} />
            <meshBasicMaterial color={wireColor} wireframe transparent opacity={0.7} side={THREE.DoubleSide} />
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
    // 2026-08-15: baseline raised from 0.35 to 0.6 -- confirmed via
    // screenshot the original pulse (0.35 +/- 0.25) was invisible against
    // the policy plane's own near-coplanar fill mesh.
    const pulse = 0.6 + 0.3 * Math.sin(clock.elapsedTime * 0.6);
    if (ringMaterial.current) ringMaterial.current.emissiveIntensity = pulse;
    if (ringRef.current) ringRef.current.rotation.z = clock.elapsedTime * 0.05;
  });

  return (
    // 2026-08-15 visibility fix: lifted 0.08 units above the policy plane.
    // The aperture's own child meshes were sitting at effectively the same
    // world Y as the policy plane's fill+wireframe meshes (both groups
    // positioned at PLANE_Y.policy) -- genuine z-fighting/coplanar overlap,
    // confirmed via screenshot: the aperture was completely invisible.
    <group position={[0, PLANE_Y.policy + 0.08, 0]}>
      {/* Craft pass: additive-blended glow halo behind the ring — cheap
          "fake bloom" that doesn't need @react-three/postprocessing (whose
          current majors track fiber v9; this repo is pinned to v8, see
          plan §3). depthWrite={false} so it never occludes the particles
          passing through. Radius/opacity raised 2026-08-15 (screenshot
          showed it wasn't visible at the original 1.7/0.1). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <circleGeometry args={[2.3, 40]} />
        <meshBasicMaterial
          color={tokens.accent}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.22, 48]} />
        <meshStandardMaterial
          ref={ringMaterial}
          color={tokens.accentDark}
          emissive={tokens.accent}
          emissiveIntensity={0.6}
          transparent
          opacity={0.95}
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

// Rest/replay model (2026-08-15, replaces the original continuous 7s
// loop). Default: every row's phase is permanently 1 (landed) — the
// ledger, already written. A "Replay" click (playSignal increments)
// starts a single real, compressed playthrough using
// REPLAY_START_OFFSETS/REPLAY_TRAVEL_DURATION, then returns to rest.
// isPlaying/playStart live in refs, not React state, since they're read
// every frame inside useFrame — only the play/pause *edges* notify the
// parent (onPlayStateChange), not every frame.
function Particles({
  tokens,
  playSignal,
  onPlayStateChange,
}: {
  tokens: Tokens;
  playSignal: number;
  onPlayStateChange: (playing: boolean) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const heatRefs = useRef<THREE.Mesh[]>([]);
  const isPlaying = useRef(false);
  const playStart = useRef(0);
  const lastPlaySignal = useRef(playSignal);

  useEffect(() => {
    if (playSignal === lastPlaySignal.current) return;
    lastPlaySignal.current = playSignal;
    isPlaying.current = true;
    playStart.current = -1; // sentinel: set from clock.elapsedTime on the next frame
    onPlayStateChange(true);
  }, [playSignal, onPlayStateChange]);

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
        startOffset: REPLAY_START_OFFSETS[i] ?? 0,
      })),
    []
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (isPlaying.current && playStart.current === -1) {
      playStart.current = clock.elapsedTime;
    }
    const elapsedSincePlay = isPlaying.current ? clock.elapsedTime - playStart.current : Infinity;

    const nodeHeat = new Array(BACKEND_ROUTES.length).fill(0);

    rows.forEach(({ row, lane, node, startOffset }, i) => {
      const localElapsed = elapsedSincePlay - startOffset;
      // Hold at the lane position (bypass/center) for the first 30% of this
      // row's travel window, then ease toward its real execution node for
      // the remaining 70% — reads better than an even 50/50 split at the
      // ~1.1s per-row travel duration used during replay (vs. the original
      // 7s ambient cycle).
      const phase = THREE.MathUtils.clamp(localElapsed / REPLAY_TRAVEL_DURATION, 0, 1);
      const y = PLANE_Y.request - (PLANE_Y.request - PLANE_Y.execution) * phase;
      const x = phase < 0.3 ? lane : THREE.MathUtils.lerp(lane, node, (phase - 0.3) / 0.7);

      dummy.position.set(x, y, 0);
      // 2026-08-15 visibility fix: the original 0.08-0.11 scale was
      // confirmed (via screenshot) to be nearly invisible at this camera
      // distance against the dark background.
      const scale = row.pool === "paid" ? 0.19 : 0.15;
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

    if (isPlaying.current && elapsedSincePlay > REPLAY_TOTAL_DURATION + 0.3) {
      isPlaying.current = false;
      onPlayStateChange(false);
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, LEDGER.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        {/* 2026-08-15 visibility fix: this had NO color/emissive config at
            all — a bare white PBR material lit only by two modest point
            lights, on tiny instances against a near-black background,
            confirmed via screenshot to render as effectively invisible.
            Per-instance color (set via setColorAt in useFrame) drives the
            diffuse channel as before; a flat emissive floor here (uniform
            across instances, Three.js instance color doesn't reach the
            emissive channel) guarantees every particle stays visible
            regardless of external lighting, while the per-instance hue
            still dominates on top of it. */}
        <meshStandardMaterial emissive={tokens.accent} emissiveIntensity={0.55} roughness={0.4} />
      </instancedMesh>
      <ExecutionNodes tokens={tokens} heatRefsOut={heatRefs} />
    </>
  );
}

// Constrained camera: a scripted intro dolly (craft pass — camera
// choreography instead of snapping straight to the working view), then a
// damped orbit inside a limited azimuth/polar range plus slow auto-drift.
// No free-fly, no zoom. Mobile gets a fixed 3/4 view with drag disabled
// (touch-drag on a small canvas fights page scroll) but keeps the same
// slow auto-drift.
//
// OrbitControls only mounts once the intro finishes, so it captures its
// baseline spherical state from the final resting position — a manual
// camera.position lerp running in the same frame OrbitControls.update()
// runs would fight it, since OrbitControls recomputes position from its
// own internal spherical state, not from external mutations.
function Rig({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree();
  const [introDone, setIntroDone] = useState(false);
  const introStart = useRef<number | null>(null);
  const from = useMemo(() => new THREE.Vector3(...CAMERA_FROM), []);
  const to = useMemo(() => new THREE.Vector3(...CAMERA_TO), []);

  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(({ clock }) => {
    if (introDone) return;
    if (introStart.current === null) introStart.current = clock.elapsedTime;
    const t = THREE.MathUtils.clamp((clock.elapsedTime - introStart.current) / INTRO_SECONDS, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    camera.position.lerpVectors(from, to, eased);
    camera.lookAt(0, 0, 0);
    if (t >= 1) setIntroDone(true);
  });

  if (!introDone) return null;

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

export default function ShowcaseScene({
  onContextLost,
  playSignal,
  onPlayStateChange,
}: {
  onContextLost: () => void;
  playSignal: number;
  onPlayStateChange: (playing: boolean) => void;
}) {
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
      {/* Craft pass: subtle atmospheric falloff toward the scene edges —
          a small depth/atmosphere cue on top of the lighting changes
          above; the camera's near-perpendicular framing of the plane
          stack means fog alone was never going to carry depth grading by
          itself, so this is deliberately subtle, not the primary effect. */}
      <fog attach="fog" args={[tokens.bgDarker, 9, 24]} />
      {/* 2026-08-15: raised across the board — screenshot confirmed the
          original levels left the scene reading as near-empty/black. */}
      <ambientLight intensity={0.85} />
      <pointLight position={[6, 6, 6]} intensity={1.8} />
      <pointLight position={[-6, -3, 4]} intensity={0.9} color={tokens.accent} />
      <pointLight position={[0, 0, 6]} intensity={0.6} color={tokens.accent} />
      <Planes tokens={tokens} />
      <BudgetAperture tokens={tokens} />
      <Particles tokens={tokens} playSignal={playSignal} onPlayStateChange={onPlayStateChange} />
      <Rig isMobile={isMobile} />
    </Canvas>
  );
}
