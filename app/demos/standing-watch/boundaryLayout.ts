// Layout + timing constants for "The Boundary" — reuses /showcase's
// corridor-and-gate shape (see components/three/{Gate,Ribbons,Pulses}.tsx)
// on Standing Watch's own real 9-row findings set
// (lib/standing-watch-findings.ts), per
// ~/SecondBrain/TiogaAI/research/2026-09-14-standing-watch-3d-scene-fresh-review.md
// §2/§5. One new idea vs. the showcase/checkpoint-walk precedents: 8 of 9
// rows land at their own individual terminal (not a shared "pool" — each
// finding is independently resolved), and the 9th (FileVault, the one
// status:"human" row) travels dead center through the gate to a physical
// wall just past it, instead of continuing to a terminal — verified against
// FLAGGED before writing this, not assumed.
import * as THREE from "three";
import { FLAGGED, CROSSES_GATE, type FindingRow } from "../../../lib/standing-watch-findings";

export const CORRIDOR_X = { tiles: -4.6, gate: 0, wall: 1.35, landed: 4.6 };
export const TILE_Y_RANGE: [number, number] = [3.4, -3.4];
export const LANDED_Y_RANGE: [number, number] = [2.6, -2.6];

export function tileY(index: number, total: number): number {
  if (total <= 1) return 0;
  const [top, bottom] = TILE_Y_RANGE;
  return top - (top - bottom) * (index / (total - 1));
}

export function tileZ(index: number): number {
  return index % 2 === 0 ? 0.32 : -0.32;
}

export function landedY(landedIndex: number, totalLanded: number): number {
  if (totalLanded <= 1) return 0;
  const [top, bottom] = LANDED_Y_RANGE;
  return top - (top - bottom) * (landedIndex / (totalLanded - 1));
}

export interface BoundaryRowGeom {
  row: FindingRow;
  index: number;
  curve: THREE.CatmullRomCurve3;
  tilePosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  radius: number;
  startOffset: number;
  /** True for the one row (FileVault) that stops at the wall instead of landing. */
  stopsAtWall: boolean;
}

// Fixed, evenly-spaced replay cadence — deliberate, since (per the research
// doc's honesty accounting) FLAGGED carries one shared capture date and no
// real per-row timestamps to space a replay by. Captioned in the UI as
// illustrative ordering, not real timing gaps.
export const REPLAY_STEP_SECONDS = 0.55;
export const REPLAY_TRAVEL_DURATION = 2.4;
export const REPLAY_START_OFFSETS: number[] = FLAGGED.map((_, i) => i * REPLAY_STEP_SECONDS);
export const REPLAY_TOTAL_DURATION =
  Math.max(...REPLAY_START_OFFSETS) + REPLAY_TRAVEL_DURATION;

export function buildRowGeometry(): BoundaryRowGeom[] {
  let landedIndex = 0;
  return FLAGGED.map((row, i) => {
    const tile = new THREE.Vector3(CORRIDOR_X.tiles, tileY(i, FLAGGED.length), tileZ(i));
    const gate = new THREE.Vector3(CORRIDOR_X.gate, 0, 0);
    const stopsAtWall = row.status === "human";
    // Ends just short of the wall's own position (Scene.tsx's <Wall> group
    // sits at CORRIDOR_X.wall) so the ribbon visibly meets the wall's face
    // rather than passing through its center.
    const end = stopsAtWall
      ? new THREE.Vector3(CORRIDOR_X.wall - 0.08, 0, 0)
      : new THREE.Vector3(CORRIDOR_X.landed, landedY(landedIndex, CROSSES_GATE.length), 0);
    if (!stopsAtWall) landedIndex += 1;
    const curve = new THREE.CatmullRomCurve3([tile, gate, end]);
    return {
      row,
      index: i,
      curve,
      tilePosition: tile,
      endPosition: end,
      radius: stopsAtWall ? 0.055 : 0.04,
      startOffset: REPLAY_START_OFFSETS[i],
      stopsAtWall,
    };
  });
}

// --- Cinematic intro (five-shot camera sequence, ~17s total) -----------
//
// "Open -> Enter -> Gate -> Boundary -> Resolved," per the approved concept
// render's pacing (research doc §6). Positions tuned against this file's
// own CORRIDOR_X so the camera always frames real geometry (tiles at
// CORRIDOR_X.tiles, gate at origin, wall at CORRIDOR_X.wall, landed
// terminals at CORRIDOR_X.landed) -- not arbitrary numbers borrowed from
// Showcase's differently-scaled corridor.
export interface CameraShot {
  name: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  /** Seconds to ease into this shot from the previous one's end pose. */
  seconds: number;
}

export const CINEMATIC_SHOTS: CameraShot[] = [
  { name: "Open", position: [3.2, 6.4, 17.5], lookAt: [0, 0, 0], seconds: 3.0 },
  { name: "Enter", position: [-1.8, 3.1, 9.6], lookAt: [-2.2, 0, 0], seconds: 3.5 },
  { name: "Gate", position: [0.9, 1.0, 3.9], lookAt: [0, 0, 0], seconds: 3.5 },
  // Deliberately much closer than Gate's ~4-unit distance -- a real push-in
  // on the wall specifically, not just a re-angled version of the Gate
  // shot. Verified against the actual rendered frame, not assumed from the
  // numbers alone (see this file's own history: the first draft of this
  // shot measured out fine on paper but read nearly identical to Gate on
  // screen, per docs/design/3d-design-standard.md's own "screenshot it,
  // then look" discipline).
  { name: "Boundary", position: [1.75, 0.32, 1.55], lookAt: [1.35, 0, 0], seconds: 4.0 },
  // lookAt is [0,0,0], matching DriftRig's own fixed lookAt(0,0,0) — this
  // shot's end pose is what DriftRig takes over from (see Scene.tsx), so
  // the handoff has to target the same point or the camera would visibly
  // snap when OrbitControls (which always targets the origin) engages.
  { name: "Resolved", position: [2.2, 3.5, 11.2], lookAt: [0, 0, 0], seconds: 3.0 },
];

export const CINEMATIC_TOTAL_SECONDS = CINEMATIC_SHOTS.reduce((sum, s) => sum + s.seconds, 0);

export const RESOLVED_SHOT = CINEMATIC_SHOTS[CINEMATIC_SHOTS.length - 1];
