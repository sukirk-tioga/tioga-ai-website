"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Gate from "../../../components/three/Gate";
import Ribbons, { type RibbonRow } from "../../../components/three/Ribbons";
import Pulses, { type PulseRow } from "../../../components/three/Pulses";
import DriftRig from "../../../components/three/DriftRig";
import { useTokens } from "../../../components/three/useTokens";
import BoundaryEffects from "./BoundaryEffects";
import {
  buildRowGeometry,
  CORRIDOR_X,
  CINEMATIC_SHOTS,
  CINEMATIC_TOTAL_SECONDS,
  RESOLVED_SHOT,
  REPLAY_TRAVEL_DURATION,
  REPLAY_TOTAL_DURATION,
} from "./boundaryLayout";
import type { FindingRow } from "../../../lib/standing-watch-findings";

// "The Boundary" — reuses /showcase's corridor-and-gate shape (Gate/
// Ribbons/Pulses, now real shared components in components/three/, not
// re-implemented inline — see this repo's docs/design/3d-design-standard.md
// build-plan note calling out that gap on prior pilots) on Standing Watch's
// own real 9-row findings set. See
// ~/SecondBrain/TiogaAI/research/2026-09-14-standing-watch-3d-scene-fresh-review.md
// for the full spec and honesty accounting this file implements.
//
// Palette: a deliberate, session-recorded override of this site's default
// 3D visual-restraint calibration (docs/design/3d-design-standard.md §1.1)
// — Sukirk's explicit call, 2026-09-14, via iterated concept-render review.
// Colors still come exclusively from CSS custom properties (readToken
// pattern via useTokens) — zero hex literals in this file — they're just
// the new --boundary-* tokens (app/globals.css) instead of the muted
// sitewide --accent/--success trio. Severity coloring reads the
// --scene-error/--scene-warning-light/--scene-text-muted-3 tokens, which hold
// the original --error/--warning-light/--text-muted-3 values (the DOM tokens
// were darkened 2026-09-20 for WCAG AA text contrast on light surfaces; the
// dark canvas keeps the pale originals).

const TOKEN_NAMES = {
  bg: "--bg-solutions-field",
  border: "--border",
  accent: "--accent",
  accentDark: "--accent-dark",
  error: "--scene-error",
  warningLight: "--scene-warning-light",
  textMuted3: "--scene-text-muted-3",
  gold: "--boundary-gold",
  amber: "--boundary-amber",
  cyan: "--boundary-cyan",
  violet: "--boundary-violet",
  green: "--boundary-green",
  wallCore: "--boundary-wall-core",
  wallMagenta: "--boundary-wall-magenta",
  wallEdge: "--boundary-wall-edge",
} as const;

type Tokens = { [K in keyof typeof TOKEN_NAMES]: string };

function severityColor(tokens: Tokens, severity: FindingRow["severity"]): string {
  if (severity === "CRITICAL") return tokens.error;
  if (severity === "HIGH") return tokens.warningLight;
  return tokens.textMuted3;
}

// --- Tiles: one per finding, entering left, sized/colored by real severity.
function Tile({
  position,
  color,
  large,
  highlighted,
}: {
  position: [number, number, number];
  color: string;
  large: boolean;
  highlighted: boolean;
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (matRef.current) matRef.current.emissiveIntensity = highlighted ? 0.95 : 0.5;
  });
  const size = large ? 0.34 : 0.24;
  return (
    <mesh position={position}>
      <boxGeometry args={[size, size, size * 0.55]} />
      <meshStandardMaterial ref={matRef} color={color} emissive={color} emissiveIntensity={0.5} roughness={0.4} />
    </mesh>
  );
}

// --- Landed terminals: one per fixed finding, steady-glowing at rest — the
// "8 of 9 land and stay lit" density the rest state has to carry alone.
function LandedTerminal({
  position,
  color,
  highlighted,
}: {
  position: [number, number, number];
  color: string;
  highlighted: boolean;
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current) {
      const breathe = 0.08 * Math.sin(clock.elapsedTime * 0.6 + position[1] * 2);
      matRef.current.emissiveIntensity = (highlighted ? 0.85 : 0.5) + breathe;
    }
  });
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.15, 20, 20]} />
      <meshStandardMaterial ref={matRef} color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} />
    </mesh>
  );
}

// --- The wall: the one physical object new to this scene. FileVault's
// ribbon meets it and stops, permanently — not a failure state (accent, not
// error, per the research doc's explicit correction) with a bold impact
// burst (white-hot core -> magenta -> orange edge, the one place this scene
// spends its boldest colors) that breathes continuously at rest (honest
// ambient motion, §3.1) and gets a real, event-driven boost exactly when a
// replay pulse actually arrives (`impact`, written by Pulses' onArrive).
function Wall({
  tokens,
  position,
  impact,
  highlighted,
}: {
  tokens: Tokens;
  position: [number, number, number];
  impact: React.MutableRefObject<number>;
  highlighted: boolean;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const midMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const edgeMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const panelMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const displayed = useRef(0);

  useFrame(({ clock }, delta) => {
    // impact is a one-shot trigger (set to 1 by Pulses' onArrive) that this
    // component itself decays back to 0 -- a fast-attack/slow-decay bump on
    // top of the permanent ambient breathe below, not a value some other
    // owner has to remember to reset.
    impact.current = Math.max(0, impact.current - delta * 0.4);
    const target = impact.current;
    const rate = target > displayed.current ? 16 : 2.2;
    displayed.current += (target - displayed.current) * Math.min(delta * rate, 1);
    const boost = displayed.current;
    const breathe = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 0.8);

    if (edgeMatRef.current) edgeMatRef.current.opacity = 0.12 + 0.06 * breathe + boost * 0.35;
    if (midMatRef.current) midMatRef.current.opacity = 0.2 + 0.1 * breathe + boost * 0.45;
    if (coreMatRef.current) coreMatRef.current.opacity = 0.32 + 0.15 * breathe + boost * 0.55;
    if (coreRef.current) coreRef.current.scale.setScalar(1 + 0.08 * breathe + boost * 0.6);
    if (panelMatRef.current) panelMatRef.current.emissiveIntensity = (highlighted ? 0.6 : 0.35) + boost * 0.5;
  });

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.14, 2.2, 1.6]} />
        <meshStandardMaterial ref={panelMatRef} color={tokens.border} emissive={tokens.accent} emissiveIntensity={0.35} roughness={0.6} />
      </mesh>
      <mesh position={[-0.075, 0, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial ref={edgeMatRef} color={tokens.wallEdge} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[-0.08, 0, 0]}>
        <circleGeometry args={[0.25, 32]} />
        <meshBasicMaterial ref={midMatRef} color={tokens.wallMagenta} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef} position={[-0.085, 0, 0]}>
        <circleGeometry args={[0.12, 32]} />
        <meshBasicMaterial ref={coreMatRef} color={tokens.wallCore} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// --- Five-shot cinematic intro (Open -> Enter -> Gate -> Boundary ->
// Resolved, ~17s total, boundaryLayout.ts's CINEMATIC_SHOTS) — then hands
// off to DriftRig at the exact pose CINEMATIC_SHOTS' last shot ends on, so
// there's no visible jump at handoff.
function CinematicRig({ onComplete }: { onComplete: () => void }) {
  const { camera } = useThree();
  const startTime = useRef<number | null>(null);
  const done = useRef(false);
  const scratchA = useMemo(() => new THREE.Vector3(), []);
  const scratchB = useMemo(() => new THREE.Vector3(), []);
  const scratchLook = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (done.current) return;
    if (startTime.current === null) startTime.current = clock.elapsedTime;
    const rawElapsed = clock.elapsedTime - startTime.current;
    // Clamp strictly below the total before shot-selection: at rawElapsed
    // >= CINEMATIC_TOTAL_SECONDS (the frame that also triggers onComplete
    // below), the loop's `<` comparison fails for every shot including the
    // last one, falling through without ever breaking -- acc ends up as
    // the sum of ALL shots' seconds (the total) instead of the last shot's
    // own start time, which briefly recomputes localT near 0 instead of 1
    // and snaps the camera back toward the second-to-last shot's pose for
    // one frame right before handoff. Found by instrumenting real camera
    // positions frame-by-frame, not by inspection -- the arithmetic looked
    // right until elapsed actually reached the boundary.
    const elapsed = Math.min(rawElapsed, CINEMATIC_TOTAL_SECONDS - 0.001);

    let acc = 0;
    let shotIndex = CINEMATIC_SHOTS.length - 1;
    for (let i = 0; i < CINEMATIC_SHOTS.length; i++) {
      if (elapsed < acc + CINEMATIC_SHOTS[i].seconds) {
        shotIndex = i;
        break;
      }
      acc += CINEMATIC_SHOTS[i].seconds;
    }
    const shot = CINEMATIC_SHOTS[shotIndex];
    const prev = shotIndex === 0 ? shot : CINEMATIC_SHOTS[shotIndex - 1];
    const localT = THREE.MathUtils.clamp((elapsed - acc) / shot.seconds, 0, 1);
    const eased = 1 - Math.pow(1 - localT, 3);

    scratchA.set(...prev.position);
    scratchB.set(...shot.position);
    camera.position.lerpVectors(scratchA, scratchB, eased);
    scratchA.set(...prev.lookAt);
    scratchB.set(...shot.lookAt);
    scratchLook.lerpVectors(scratchA, scratchB, eased);
    camera.lookAt(scratchLook);

    if (rawElapsed >= CINEMATIC_TOTAL_SECONDS) {
      done.current = true;
      onComplete();
    }
  });

  return null;
}

export interface BoundarySceneProps {
  onContextLost: () => void;
  playSignal: number;
  onPlayStateChange: (playing: boolean) => void;
  selectedIndex: number | null;
  onCross?: (rowIndex: number) => void;
  onArrive?: (rowIndex: number) => void;
  /** Play the full 5-shot cinematic intro. Default false: ordinary visitors
   *  land straight on the Resolved/rest pose and can interact immediately —
   *  the cinematic itself is meant to be seen as a captured hero video
   *  (like /showcase's poster), not re-run live for every visitor on the
   *  interactive scene (research doc §6: "not a live-rendered default for
   *  every visitor"). Set via BoundaryCanvasLoader's `?cinematic=1` query
   *  param, used only by the one-off capture script that records the hero
   *  video — see scripts/capture-boundary-hero.mjs. */
  forceCinematic?: boolean;
}

export default function BoundaryScene({
  onContextLost,
  playSignal,
  onPlayStateChange,
  selectedIndex,
  onCross,
  onArrive,
  forceCinematic = false,
}: BoundarySceneProps) {
  const tokens = useTokens(TOKEN_NAMES);
  const [isMobile, setIsMobile] = useState(false);
  const [cinematicDone, setCinematicDone] = useState(!forceCinematic);
  const gateActivity = useRef(0);
  const wallImpact = useRef(0);

  useMemo(() => {
    if (typeof window !== "undefined") setIsMobile(window.innerWidth < 768);
  }, []);

  const rows = useMemo(() => buildRowGeometry(), []);

  const ribbonRows: RibbonRow[] = useMemo(() => {
    if (!tokens) return [];
    return rows.map((r) => ({
      curve: r.curve,
      radius: r.radius,
      color: r.stopsAtWall ? tokens.accent : tokens.green,
      baseEmissive: 0.4,
    }));
  }, [rows, tokens]);

  const pulseRows: PulseRow[] = useMemo(() => {
    if (!tokens) return [];
    return rows.map((r) => ({
      curve: r.curve,
      startOffset: r.startOffset,
      size: r.stopsAtWall ? 0.15 : 0.11,
      colorBeforeCross: severityColor(tokens, r.row.severity),
      colorAtCross: tokens.gold,
      colorAfterCross: r.stopsAtWall ? tokens.accent : tokens.green,
    }));
  }, [rows, tokens]);

  const wallRow = rows.find((r) => r.stopsAtWall);
  const wallPosition: [number, number, number] = [CORRIDOR_X.wall, 0, 0];

  if (!tokens) return null;

  return (
    <Canvas
      camera={{ position: forceCinematic ? CINEMATIC_SHOTS[0].position : RESOLVED_SHOT.position, fov: 42 }}
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
      <color attach="background" args={[tokens.bg]} />
      <fog attach="fog" args={[tokens.bg, 11, 28]} />
      <ambientLight intensity={0.13} />
      {/* Key light, warm gold — matches the gate's own bloom color. */}
      <pointLight position={[-6, 6.5, 8.5]} intensity={2.4} color={tokens.gold} decay={1.4} />
      {/* Rim lights either side of the gate, cyan / violet — the bold
          palette's signature move, per the research doc §7. Pure lighting,
          no data claim (§3.1: honest ambient motion — these don't move or
          flicker, they're static chrome). */}
      <pointLight position={[-1.6, 0.6, 2.4]} intensity={1.4} color={tokens.cyan} decay={1.8} />
      <pointLight position={[1.6, 0.6, 2.4]} intensity={1.4} color={tokens.violet} decay={1.8} />
      <pointLight position={[6, -1, -7]} intensity={0.35} color="white" decay={1.6} />
      <pointLight position={[0, 1.5, 6]} intensity={0.35} decay={1.8} />

      {rows.map((r, i) => (
        <Tile
          key={i}
          position={[r.tilePosition.x, r.tilePosition.y, r.tilePosition.z]}
          color={severityColor(tokens, r.row.severity)}
          large={r.row.severity === "CRITICAL" || r.stopsAtWall}
          highlighted={selectedIndex === i}
        />
      ))}

      <Ribbons rows={ribbonRows} />

      <Gate position={[0, 0, 0]} frameColor={tokens.amber} glowColor={tokens.gold} activity={gateActivity} frameWidth={1.0} frameHeight={1.9} />

      {rows
        .filter((r) => !r.stopsAtWall)
        .map((r) => (
          <LandedTerminal
            key={r.index}
            position={[r.endPosition.x, r.endPosition.y, r.endPosition.z]}
            color={tokens.green}
            highlighted={selectedIndex === r.index}
          />
        ))}

      {wallRow && (
        <Wall tokens={tokens} position={wallPosition} impact={wallImpact} highlighted={selectedIndex === wallRow.index} />
      )}

      <Pulses
        rows={pulseRows}
        playSignal={playSignal}
        travelDuration={REPLAY_TRAVEL_DURATION}
        totalDuration={REPLAY_TOTAL_DURATION}
        onPlayStateChange={onPlayStateChange}
        onCross={onCross}
        onArrive={(i) => {
          if (rows[i]?.stopsAtWall) wallImpact.current = 1;
          onArrive?.(i);
        }}
        gateActivity={gateActivity}
      />

      {!cinematicDone && <CinematicRig onComplete={() => setCinematicDone(true)} />}
      {cinematicDone && (
        <DriftRig
          cameraFrom={RESOLVED_SHOT.position}
          cameraTo={RESOLVED_SHOT.position}
          introSeconds={0.01}
          minAzimuthAngle={-0.5}
          maxAzimuthAngle={0.35}
          enableRotate={!isMobile}
        />
      )}
      <BoundaryEffects />
    </Canvas>
  );
}
