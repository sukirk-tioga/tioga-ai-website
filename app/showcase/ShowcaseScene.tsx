"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  LEDGER,
  BACKEND_ROUTES,
  REPLAY_START_OFFSETS,
  REPLAY_TRAVEL_DURATION,
  REPLAY_TOTAL_DURATION,
} from "../../lib/governance-ledger";
import ShowcaseEffects from "./ShowcaseEffects";

// The Gateway Corridor — full rebuild, 2026-08-15 (round 3).
//
// Two prior rounds (a vertical three-plane stack, then the same stack with
// added flight-path lines and comet trails) both shipped clean and
// verified, and both got the same verdict from Sukirk after actually
// looking: no wow factor, not quickly understood. Fable 5's round-3
// critique (reading real screenshots, not code) concluded the *concept*
// was the ceiling, not the execution: vertical stacking carries no
// semantics — nothing about "up vs down" says request -> governance ->
// model -- and a scene with no focal object and a bilaterally symmetric,
// hero-less composition cannot read as premium no matter how it's lit.
//
// This scene replaces the stack entirely with a horizontal corridor: 17
// real rows enter as tiles on the left, converge through a single bright
// "gate" (the hero object, the one thing designed to be seen first) at
// the center, and fan out to 3 real backend pools on the right. Each row
// is a ribbon whose WIDTH is its real token count and whose brightness
// reflects its real pool (free vs paid) -- the data drives the geometry,
// not just the color. On Replay, a pulse travels each ribbon on its real,
// compressed timing (same REPLAY_START_OFFSETS/REPLAY_TRAVEL_DURATION
// derivation as before) and flashes green -- the one reserved use of
// --success in this scene -- exactly as it crosses the gate, then
// continues to its pool. At rest (no replay running), the static ribbons
// alone carry the "17 real rows, real variation" density story, since
// most visitors never click Replay.
//
// Colors are read from CSS custom properties at runtime via
// getComputedStyle — this repo forbids hex literals in TSX. No hex
// literal appears in this file.
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

// --- Corridor layout ----------------------------------------------------
//
// Left column: 17 row tiles, ordered chronologically top-to-bottom (index
// order in LEDGER is already chronological). Center: the gate, at the
// exact midpoint every ribbon's curve passes through -- a true visual
// chokepoint, not an approximation. Right column: the 3 real backend
// pools (BACKEND_ROUTES).
const CORRIDOR_X = { tiles: -4.4, gate: 0, pools: 4.4 };
const TILE_Y_RANGE: [number, number] = [2.6, -2.6];
const POOL_Y_RANGE: [number, number] = [1.5, -1.5];

function tileY(index: number): number {
  if (LEDGER.length <= 1) return 0;
  const [top, bottom] = TILE_Y_RANGE;
  return top - (top - bottom) * (index / (LEDGER.length - 1));
}

function tileZ(index: number): number {
  // Small alternating depth stagger -- purely a composition aid so the
  // tile column reads as a real 3D cluster instead of a flat line; the
  // curve still converges every ribbon to the exact same gate point
  // regardless, so this never implies anything about the data.
  return index % 2 === 0 ? 0.35 : -0.35;
}

function poolY(index: number, total: number): number {
  if (total <= 1) return 0;
  const [top, bottom] = POOL_Y_RANGE;
  return top - (top - bottom) * (index / (total - 1));
}

// Scripted intro camera dolly: eases from a wider establishing shot into
// the working view, then hands off to OrbitControls only once it
// completes (so OrbitControls captures its baseline spherical state from
// the final position, not the intro's -- avoids fighting a manual lerp
// running the same frame as OrbitControls' own update).
const CAMERA_FROM: [number, number, number] = [2.2, 5.5, 15.5];
const CAMERA_TO: [number, number, number] = [1.6, 2.4, 10.5];
const INTRO_SECONDS = 1.8;

const GATE_CROSS_WINDOW = 0.06; // phase +/- this counts as "crossing the gate"

interface RowGeom {
  row: (typeof LEDGER)[number];
  curve: THREE.CatmullRomCurve3;
  radius: number;
  startOffset: number;
}

function buildRowGeometry(): RowGeom[] {
  const tokenSums = LEDGER.map((r) => r.in + r.out);
  const minTokens = Math.min(...tokenSums);
  const maxTokens = Math.max(...tokenSums);
  const spread = Math.max(maxTokens - minTokens, 1);

  return LEDGER.map((row, i) => {
    const poolIndex = BACKEND_ROUTES.indexOf(row.served);
    const tile = new THREE.Vector3(CORRIDOR_X.tiles, tileY(i), tileZ(i));
    const gate = new THREE.Vector3(CORRIDOR_X.gate, 0, 0);
    const pool = new THREE.Vector3(CORRIDOR_X.pools, poolY(poolIndex, BACKEND_ROUTES.length), 0);
    const curve = new THREE.CatmullRomCurve3([tile, gate, pool]);
    const norm = (tokenSums[i] - minTokens) / spread;
    const radius = 0.028 + norm * 0.07;
    return { row, curve, radius, startOffset: REPLAY_START_OFFSETS[i] ?? 0 };
  });
}

function RowTiles({ tokens }: { tokens: Tokens }) {
  return (
    <>
      {LEDGER.map((row, i) => (
        <mesh key={i} position={[CORRIDOR_X.tiles, tileY(i), tileZ(i)]}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshStandardMaterial
            color={row.pool === "paid" ? tokens.accentDark : tokens.accent}
            emissive={row.pool === "paid" ? tokens.accentDark : tokens.accent}
            emissiveIntensity={0.5}
            roughness={0.4}
          />
        </mesh>
      ))}
    </>
  );
}

// The gate — the hero object every ribbon visually converges through.
// Softly breathes at rest (ambient sine pulse); briefly brightens when a
// replay pulse is actively crossing it (gateActivity, written by Pulses
// every frame, read here — same cross-component ref pattern the old
// ExecutionNodes/Particles heat glow used).
function Gate({ tokens, gateActivity }: { tokens: Tokens; gateActivity: React.MutableRefObject<number> }) {
  const frameMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  const haloMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const scanRingRef = useRef<THREE.Mesh>(null);
  const scanRingMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const discMaterial = useRef<THREE.MeshBasicMaterial>(null);
  // Smoothed follower for gateActivity (raw activity snaps as pulses enter/
  // exit the GATE_CROSS_WINDOW). A real event -- a ledger row actually
  // crossing the gate -- deserves a felt "kick," which a hard snap to a
  // target value doesn't give; a fast attack / slower decay envelope
  // (an audio-compressor shape) reads as physical impact and settle
  // instead of a value teleporting. This is still driven entirely by
  // gateActivity, which Pulses only sets nonzero while a real pulse is
  // actually inside the crossing window -- honest per §3.1, just with a
  // more organic response curve on top of a real event.
  const displayedActivity = useRef(0);

  // 2026-08-15 round 4: Sukirk — "still not moving much... not
  // eye-pleasing." Adds continuous, honest ambient motion (chrome, not a
  // claim about specific data — same distinction that keeps this
  // different from the banned continuous-particle-loop): a slowly
  // rotating scan ring (a decorative device, not a data value) and a
  // breathing glow disc, both always running so the gate never reads as
  // a frozen frame, and both readable as "structure," not "these are the
  // real events happening right now."
  useFrame(({ clock }, delta) => {
    // Fast attack toward a rising target, slower decay toward a falling
    // one -- an envelope follower, not a direct assignment.
    const target = gateActivity.current;
    const rate = target > displayedActivity.current ? 14 : 3.2;
    displayedActivity.current += (target - displayedActivity.current) * Math.min(delta * rate, 1);
    const activity = displayedActivity.current;

    const breathe = 0.55 + 0.2 * Math.sin(clock.elapsedTime * 0.7);
    const boost = activity * 1.4;
    frameMaterials.current.forEach((mat) => {
      if (mat) mat.emissiveIntensity = breathe + boost;
    });
    if (haloMaterial.current) haloMaterial.current.opacity = 0.16 + activity * 0.3;
    if (scanRingRef.current) scanRingRef.current.rotation.z = clock.elapsedTime * 0.9;
    if (scanRingMaterial.current) {
      scanRingMaterial.current.opacity = 0.35 + 0.25 * Math.sin(clock.elapsedTime * 1.1);
    }
    if (discMaterial.current) {
      discMaterial.current.opacity = 0.1 + 0.06 * Math.sin(clock.elapsedTime * 0.9) + activity * 0.15;
    }
  });

  const frameWidth = 1.0;
  const frameHeight = 1.7;
  const bar = 0.09;

  return (
    <group position={[CORRIDOR_X.gate, 0, 0]}>
      {/* Additive-blended glow halo -- kept as a structural glow disc
          even now that real Bloom runs (ShowcaseEffects.tsx): Bloom only
          blooms pixels already above the luminance threshold, it doesn't
          conjure geometry, so this still does the work of giving the
          portal an actual lit surface: Bloom then makes it read as a real
          light source instead of a bright decal. */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[1.5, 40]} />
        <meshBasicMaterial
          ref={haloMaterial}
          color={tokens.accent}
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Breathing glow disc inside the frame -- gives the portal an
          actual surface instead of empty space bounded by an outline. */}
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[0.62, 32]} />
        <meshBasicMaterial
          ref={discMaterial}
          color={tokens.accent}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Slowly rotating scan ring -- decorative chrome (not tied to any
          real value), the one thing in this scene guaranteed to always
          be visibly moving. */}
      <mesh ref={scanRingRef} position={[0, 0, -0.01]}>
        <ringGeometry args={[0.68, 0.74, 6, 1, 0, Math.PI * 1.3]} />
        <meshBasicMaterial
          ref={scanRingMaterial}
          color={tokens.accent}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Upright rectangular portal frame -- default box orientation
          already stands facing the camera along Z, so no rotation math
          is needed; every ribbon's curve passes through (0,0,0) at its
          exact midpoint, inside this frame's opening. */}
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
              if (m) frameMaterials.current[i] = m;
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

function PoolTerminals({ tokens, poolHeat }: { tokens: Tokens; poolHeat: React.MutableRefObject<number[]> }) {
  const meshRefs = useRef<THREE.Mesh[]>([]);

  useFrame(() => {
    meshRefs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.15 + (poolHeat.current[i] ?? 0) * 1.6;
    });
  });

  return (
    <>
      {BACKEND_ROUTES.map((served, i) => (
        <mesh
          key={served}
          position={[CORRIDOR_X.pools, poolY(i, BACKEND_ROUTES.length), 0]}
          ref={(m) => {
            if (m) meshRefs.current[i] = m;
          }}
        >
          <boxGeometry args={[0.5, 0.32, 0.5]} />
          <meshStandardMaterial color={tokens.border} emissive={tokens.success} emissiveIntensity={0.15} />
        </mesh>
      ))}
    </>
  );
}

// Static ribbons — one real, dated flow path per row, permanently visible
// (most visitors never click Replay, so the rest state has to carry the
// "17 real rows" density story on its own). Width = real token count;
// brightness/color = real pool. Built once from LEDGER, not per frame.
// 2026-08-15 round 4: each ribbon gets a slow, staggered emissive
// breathe (a different phase offset per row, from a fixed hash of its
// index -- not synchronized, so it reads as ambient shimmer on real
// material, not as "these rows are firing right now"). This is
// deliberately NOT a traveling particle or anything shaped like an
// event -- that's what the banned continuous-loop design did, and
// Fable's critique of it stands. A soft brightness variation on a
// static, already-real path is closer to light catching a physical
// surface than to a fabricated activity feed.
function Ribbons({ tokens, rows }: { tokens: Tokens; rows: RowGeom[] }) {
  const freeColor = tokens.accent;
  const paidColor = tokens.accentDark;
  const materials = useRef<THREE.MeshStandardMaterial[]>([]);
  const phaseOffsets = useMemo(() => rows.map((_, i) => (i * 0.6180339887) % (Math.PI * 2)), [rows]);

  useFrame(({ clock }) => {
    materials.current.forEach((mat, i) => {
      if (!mat) return;
      const base = rows[i]?.row.pool === "paid" ? 0.6 : 0.32;
      const shimmer = 0.14 * Math.sin(clock.elapsedTime * 0.5 + phaseOffsets[i]);
      mat.emissiveIntensity = Math.max(base + shimmer, 0.1);
    });
  });

  return (
    <>
      {rows.map(({ row, curve, radius }, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 32, radius, 6, false]} />
          <meshStandardMaterial
            ref={(m) => {
              if (m) materials.current[i] = m;
            }}
            color={row.pool === "paid" ? paidColor : freeColor}
            emissive={row.pool === "paid" ? paidColor : freeColor}
            emissiveIntensity={row.pool === "paid" ? 0.6 : 0.32}
            transparent
            opacity={0.55}
            roughness={0.5}
          />
        </mesh>
      ))}
    </>
  );
}

// Replay pulses — one instanced sphere per row, hidden (scale 0) unless
// actively in transit; travels its row's real curve via
// curve.getPointAt(phase), timed by REPLAY_START_OFFSETS (derived from
// the real gaps between LEDGER timestamps, not even spacing — see
// lib/governance-ledger.ts). Flashes --success green for the one moment
// it's inside GATE_CROSS_WINDOW of the gate, then continues to its pool
// in its normal pool color. isPlaying/playStart live in refs since
// they're read every frame; only the play/pause *edges* notify the
// parent.
function Pulses({
  tokens,
  rows,
  playSignal,
  onPlayStateChange,
  gateActivity,
  poolHeat,
}: {
  tokens: Tokens;
  rows: RowGeom[];
  playSignal: number;
  onPlayStateChange: (playing: boolean) => void;
  gateActivity: React.MutableRefObject<number>;
  poolHeat: React.MutableRefObject<number[]>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const isPlaying = useRef(false);
  const playStart = useRef(0);
  const lastPlaySignal = useRef(playSignal);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (playSignal === lastPlaySignal.current) return;
    lastPlaySignal.current = playSignal;
    isPlaying.current = true;
    playStart.current = -1;
    onPlayStateChange(true);
  }, [playSignal, onPlayStateChange]);

  const poolColor = useMemo(
    () => ({
      free: new THREE.Color(tokens.accent),
      paid: new THREE.Color(tokens.accentDark),
      crossing: new THREE.Color(tokens.success),
    }),
    [tokens]
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (isPlaying.current && playStart.current === -1) {
      playStart.current = clock.elapsedTime;
    }
    const elapsedSincePlay = isPlaying.current ? clock.elapsedTime - playStart.current : Infinity;

    let activity = 0;
    const heat = new Array(BACKEND_ROUTES.length).fill(0);

    rows.forEach(({ row, curve, startOffset }, i) => {
      const localElapsed = elapsedSincePlay - startOffset;
      const phase = THREE.MathUtils.clamp(localElapsed / REPLAY_TRAVEL_DURATION, 0, 1);
      const moving = phase > 0 && phase < 1;

      if (moving) {
        const point = curve.getPointAt(phase);
        dummy.position.copy(point);
        dummy.scale.setScalar(row.pool === "paid" ? 0.13 : 0.1);
      } else {
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const crossingGate = Math.abs(phase - 0.5) < GATE_CROSS_WINDOW;
      if (crossingGate) activity += 1;
      const color = crossingGate ? poolColor.crossing : poolColor[row.pool];
      mesh.setColorAt(i, color);

      if (phase > 0.9) {
        const poolIndex = BACKEND_ROUTES.indexOf(row.served);
        const arriveHeat = 1 - (1 - phase) / 0.1;
        heat[poolIndex] = Math.max(heat[poolIndex], arriveHeat);
      }
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    gateActivity.current = Math.min(activity / 3, 1);
    poolHeat.current = heat;

    if (isPlaying.current && elapsedSincePlay > REPLAY_TOTAL_DURATION + 0.3) {
      isPlaying.current = false;
      onPlayStateChange(false);
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, LEDGER.length]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial emissive={tokens.accent} emissiveIntensity={0.7} roughness={0.35} />
    </instancedMesh>
  );
}

function Rig({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree();
  const [introDone, setIntroDone] = useState(false);
  const introStart = useRef<number | null>(null);
  const from = useMemo(() => new THREE.Vector3(...CAMERA_FROM), []);
  const to = useMemo(() => new THREE.Vector3(...CAMERA_TO), []);
  // Loosely typed (any): only .getAzimuthalAngle()/.autoRotateSpeed are
  // used here, and depending on three-stdlib's exact exported OrbitControls
  // type (drei's transitive dependency, not a direct one of this repo) is
  // fragile -- JSX's ref prop is otherwise strictly typed to that class.
  const controlsRef = useRef<any>(null);
  const direction = useRef(1);

  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(({ clock }) => {
    if (!introDone) {
      if (introStart.current === null) introStart.current = clock.elapsedTime;
      const t = THREE.MathUtils.clamp((clock.elapsedTime - introStart.current) / INTRO_SECONDS, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(from, to, eased);
      camera.lookAt(0, 0, 0);
      if (t >= 1) setIntroDone(true);
      return;
    }
    // 2026-08-15 round 4: OrbitControls' own autoRotate always advances
    // the azimuth in one direction; combined with a clamped
    // min/maxAzimuthAngle (kept deliberately narrow so the composition
    // never drifts to an unflattering angle), it drifts to the boundary
    // once and then sits frozen forever -- confirmed by reading the
    // actual behavior, not assumed. Ping-ponging the direction at each
    // boundary keeps it perpetually, visibly drifting instead.
    //
    // 2026-08-15 round 5 (external review: "constant angular velocity is
    // the single strongest 'this is a WebGL demo' tell"): the flip logic
    // above is unchanged -- it's proven and now regression-tested -- but
    // the SPEED is no longer a flat magnitude. It's shaped by how close
    // the camera is to a boundary: fast through the middle, slowing into
    // each turn, like a pendulum easing into the top of its swing rather
    // than an object hitting a wall and instantly reversing. A floor
    // (MIN_SPEED_FRACTION) keeps it always nonzero so it can never
    // read as fully stopped.
    const controls = controlsRef.current;
    if (!controls) return;
    const angle = controls.getAzimuthalAngle();
    if (angle >= 0.34) direction.current = -1;
    if (angle <= -0.49) direction.current = 1;
    const range = 0.34 - -0.49;
    const posInRange = THREE.MathUtils.clamp((angle - -0.49) / range, 0, 1);
    const MIN_SPEED_FRACTION = 0.18;
    const easeToward = Math.sin(Math.PI * posInRange); // 0 at both edges, 1 at center
    const speedMag = 3.5 * (MIN_SPEED_FRACTION + (1 - MIN_SPEED_FRACTION) * easeToward);
    controls.autoRotateSpeed = speedMag * direction.current;
  });

  if (!introDone) return null;

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      enableRotate={!isMobile}
      autoRotate
      autoRotateSpeed={3.5}
      minPolarAngle={Math.PI / 2 - 0.3}
      maxPolarAngle={Math.PI / 2 + 0.15}
      minAzimuthAngle={-0.5}
      maxAzimuthAngle={0.35}
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
  const gateActivity = useRef(0);
  const poolHeat = useRef<number[]>([]);

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

  const rows = useMemo(() => (tokens ? buildRowGeometry() : []), [tokens]);

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
      <fog attach="fog" args={[tokens.bgDarker, 10, 26]} />
      {/* Three-point lighting, replacing the prior flat symmetric fill
          (ambient 0.75 + three evenly-weighted point lights, the passport-
          photo lighting that external review flagged as the actual reason
          the scene read as a demo rather than a shot). Ambient dropped to
          near-black so darkness reads as deliberate; one hard key lights
          the gate from camera-left, one dim cool rim separates the ribbons
          from the fog behind them, and a low fill keeps the far tile/pool
          columns legible instead of crushing to black. */}
      <ambientLight intensity={0.14} />
      <pointLight position={[-6, 6.5, 8.5]} intensity={2.6} color={tokens.accent} decay={1.4} />
      <pointLight position={[6, -1, -7]} intensity={0.4} color="white" decay={1.6} />
      <pointLight position={[0, 1.5, 6]} intensity={0.4} decay={1.8} />
      <RowTiles tokens={tokens} />
      <Ribbons tokens={tokens} rows={rows} />
      <Gate tokens={tokens} gateActivity={gateActivity} />
      <PoolTerminals tokens={tokens} poolHeat={poolHeat} />
      <Pulses
        tokens={tokens}
        rows={rows}
        playSignal={playSignal}
        onPlayStateChange={onPlayStateChange}
        gateActivity={gateActivity}
        poolHeat={poolHeat}
      />
      <Rig isMobile={isMobile} />
      <ShowcaseEffects isMobile={isMobile} />
    </Canvas>
  );
}
