"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Generalized from app/showcase/ShowcaseScene.tsx's `Pulses` — one marker
// per row, hidden (scale 0) unless actively in transit, traveling its own
// curve via curve.getPointAt(phase), staggered by a per-row startOffset.
//
// Deliberately individual `<mesh>`es, not one `instancedMesh` like the
// Showcase original: `THREE.InstancedMesh.setColorAt` only tints the
// diffuse `color` term (a per-instance multiply baked into the lit
// response), it cannot vary `emissive` per instance without a custom
// shader — fine for Showcase's subtle free/paid/crossing tint, but this
// component's contract is a genuinely different, vivid *emissive* color
// per row per phase (severity while traveling, a bold cross-flash, a
// different landed-vs-stopped color after). At the row counts this repo's
// scenes actually use (single digits to ~20), N individual meshes costs
// nothing measurable and is the only way to get that right per docs/design/
// 3d-design-standard.md §5.2 trap 1 ("set emissive explicitly on anything
// that needs to be seen against a dark canvas").
export interface PulseRow {
  curve: THREE.CatmullRomCurve3;
  startOffset: number;
  size: number;
  colorBeforeCross: string;
  colorAtCross: string;
  colorAfterCross: string;
}

export interface PulsesProps {
  rows: PulseRow[];
  /** Increment to start a fresh playthrough. */
  playSignal: number;
  /** Seconds for one row to travel its full curve (0 -> 1). */
  travelDuration: number;
  /** Seconds after which the whole playthrough is considered finished (>= max row startOffset + travelDuration). */
  totalDuration: number;
  /** +/- this phase window around crossT counts as "crossing." */
  crossWindow?: number;
  /** Normalized position along the curve considered "the gate." */
  crossT?: number;
  onPlayStateChange: (playing: boolean) => void;
  /** Fires once per row per playthrough, the moment it enters the crossing window. */
  onCross?: (rowIndex: number) => void;
  /** Fires once per row per playthrough, the moment it reaches the end of its curve (phase ~1). */
  onArrive?: (rowIndex: number) => void;
  /** Written every frame: 0..1 aggregate "how much crossing activity right now," for driving a Gate's glow. */
  gateActivity: React.MutableRefObject<number>;
}

function PulseMarker({
  row,
  index,
  isPlayingRef,
  playStartRef,
  travelDuration,
  crossWindow,
  crossT,
  onCross,
  onArrive,
  contributionsRef,
}: {
  row: PulseRow;
  index: number;
  isPlayingRef: React.MutableRefObject<boolean>;
  playStartRef: React.MutableRefObject<number>;
  travelDuration: number;
  crossWindow: number;
  crossT: number;
  onCross?: () => void;
  onArrive?: () => void;
  contributionsRef: React.MutableRefObject<number[]>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const firedCross = useRef(false);
  const firedArrive = useRef(false);
  const wasPlaying = useRef(false);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    if (isPlayingRef.current && !wasPlaying.current) {
      firedCross.current = false;
      firedArrive.current = false;
    }
    wasPlaying.current = isPlayingRef.current;

    if (!isPlayingRef.current) {
      mesh.visible = false;
      contributionsRef.current[index] = 0;
      return;
    }

    const elapsedSincePlay = clock.elapsedTime - playStartRef.current;
    const localElapsed = elapsedSincePlay - row.startOffset;
    const rawPhase = localElapsed / travelDuration;
    const phase = THREE.MathUtils.clamp(rawPhase, 0, 1);
    const moving = localElapsed > 0 && rawPhase < 1.02;
    mesh.visible = moving;
    contributionsRef.current[index] = 0;
    if (!moving) return;

    const point = row.curve.getPointAt(phase);
    mesh.position.copy(point);
    mesh.scale.setScalar(row.size);

    const crossing = Math.abs(phase - crossT) < crossWindow;
    if (crossing) contributionsRef.current[index] = 1;
    const color = crossing ? row.colorAtCross : phase < crossT ? row.colorBeforeCross : row.colorAfterCross;
    mat.color.set(color);
    mat.emissive.set(color);
    mat.emissiveIntensity = crossing ? 1.3 : 0.75;

    if (crossing && !firedCross.current) {
      firedCross.current = true;
      onCross?.();
    }
    if (phase >= 0.97 && !firedArrive.current) {
      firedArrive.current = true;
      onArrive?.();
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial ref={matRef} roughness={0.35} />
    </mesh>
  );
}

export default function Pulses({
  rows,
  playSignal,
  travelDuration,
  totalDuration,
  crossWindow = 0.06,
  crossT = 0.5,
  onPlayStateChange,
  onCross,
  onArrive,
  gateActivity,
}: PulsesProps) {
  const isPlaying = useRef(false);
  const playStart = useRef(0);
  // Sentinel fixed at 0, not `useRef(playSignal)` — this component (mounted
  // via next/dynamic, ssr:false) can finish mounting *after* a user's first
  // Replay click already incremented playSignal past its initial value (a
  // real race under fast/automated clicking, caught by this repo's own
  // Playwright coverage: tests/standing-watch-boundary.spec.ts). Seeding the
  // "last seen" value from the current prop would silently swallow that
  // click forever. Seeding it at the contract's known starting value (every
  // consumer's playSignal state starts at 0 and only increments) means a
  // mount that already sees playSignal > 0 correctly plays immediately
  // instead of losing the click.
  const lastPlaySignal = useRef(0);
  const contributions = useRef<number[]>(rows.map(() => 0));

  useEffect(() => {
    if (playSignal === lastPlaySignal.current) return;
    lastPlaySignal.current = playSignal;
    isPlaying.current = true;
    playStart.current = -1;
    onPlayStateChange(true);
  }, [playSignal, onPlayStateChange]);

  useFrame(({ clock }) => {
    if (isPlaying.current && playStart.current === -1) {
      playStart.current = clock.elapsedTime;
    }
    const elapsedSincePlay = isPlaying.current ? clock.elapsedTime - playStart.current : Infinity;

    let activity = 0;
    for (const c of contributions.current) activity += c;
    gateActivity.current = Math.min(activity / 3, 1);

    if (isPlaying.current && elapsedSincePlay > totalDuration + 0.3) {
      isPlaying.current = false;
      onPlayStateChange(false);
    }
  });

  return (
    <>
      {rows.map((row, i) => (
        <PulseMarker
          key={i}
          row={row}
          index={i}
          isPlayingRef={isPlaying}
          playStartRef={playStart}
          travelDuration={travelDuration}
          crossWindow={crossWindow}
          crossT={crossT}
          onCross={onCross ? () => onCross(i) : undefined}
          onArrive={onArrive ? () => onArrive(i) : undefined}
          contributionsRef={contributions}
        />
      ))}
    </>
  );
}
