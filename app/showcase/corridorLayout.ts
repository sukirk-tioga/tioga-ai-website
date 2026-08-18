// Shared corridor layout constants -- extracted 2026-08-18 from
// ShowcaseScene.tsx so LedgerParticleField.tsx (Phase 5a) can compute the
// same tile/pool positions the ribbons and pulses already use, without a
// second, driftable copy of this math.
import { LEDGER, BACKEND_ROUTES } from "../../lib/governance-ledger";

export const CORRIDOR_X = { tiles: -4.4, gate: 0, pools: 4.4 };
export const TILE_Y_RANGE: [number, number] = [2.6, -2.6];
export const POOL_Y_RANGE: [number, number] = [1.5, -1.5];

export function tileY(index: number): number {
  if (LEDGER.length <= 1) return 0;
  const [top, bottom] = TILE_Y_RANGE;
  return top - (top - bottom) * (index / (LEDGER.length - 1));
}

export function tileZ(index: number): number {
  return index % 2 === 0 ? 0.35 : -0.35;
}

export function poolY(index: number, total: number): number {
  if (total <= 1) return 0;
  const [top, bottom] = POOL_Y_RANGE;
  return top - (top - bottom) * (index / (total - 1));
}

// Per-row pool terminal position, index-aligned with LEDGER -- the shared
// convergence target both Ribbons/Pulses (existing) and LedgerParticleField
// (new) fly toward, so a flying particle stream lands exactly where its
// row's ribbon and pulse already do.
export const ROW_POOL_POSITIONS: [number, number, number][] = LEDGER.map((row) => {
  const poolIndex = BACKEND_ROUTES.indexOf(row.served);
  return [CORRIDOR_X.pools, poolY(poolIndex, BACKEND_ROUTES.length), 0];
});
