// Pure layout math for the Reach Map scene — mirrors the role of
// app/showcase/corridorLayout.ts: no React, no three.js imports, so this
// is independently testable in Node against lib/agent-register.ts alone.
//
// Two-column layout (agents left, systems right), NOT the three-column
// tiles->gate->pools corridor — this is a bipartite authorization graph,
// asymmetric per docs/design/3d-design-standard.md §2.2: 29 agents (dense)
// on the left, 12 systems (sparse) on the right, reads as designed rather
// than as a mirrored template.
import {
  AGENTS,
  SYSTEMS,
  HERO_SYSTEM,
  CONVERGENCE_SYSTEMS,
  SYSTEM_TOUCH_COUNTS,
  type AgentRow,
  type SystemRow,
  type SystemId,
  type Tier,
} from "../../../lib/agent-register";

export const LAYOUT_X = { agents: -4.4, systems: 4.4 };
export const AGENT_Y_RANGE: [number, number] = [4.6, -4.6];
export const SYSTEM_Y_RANGE: [number, number] = [3.0, -3.0];

export function agentColumnPosition(
  index: number,
  total: number = AGENTS.length
): [number, number, number] {
  if (total <= 1) return [LAYOUT_X.agents, 0, 0];
  const [top, bottom] = AGENT_Y_RANGE;
  const y = top - (top - bottom) * (index / (total - 1));
  // Alternating depth offset, same idiom as corridorLayout.tileZ — keeps a
  // dense single column from reading as one flat, overlapping plane.
  const z = index % 2 === 0 ? 0.4 : -0.4;
  return [LAYOUT_X.agents, y, z];
}

// Reorders SYSTEMS so the hero system (highest blast radius, PIPELINE_CODE)
// lands at the vertical center of the right column — "center-weighted" per
// the task spec — while every other system keeps its lib/agent-register.ts
// SYSTEMS array order around it, not re-sorted by any other metric.
export function orderedSystems(): SystemRow[] {
  const heroRow = SYSTEMS.find((s) => s.id === HERO_SYSTEM);
  const rest = SYSTEMS.filter((s) => s.id !== HERO_SYSTEM);
  if (!heroRow) return SYSTEMS;
  const mid = Math.floor(rest.length / 2);
  return [...rest.slice(0, mid), heroRow, ...rest.slice(mid)];
}

export function systemColumnPosition(
  index: number,
  total: number
): [number, number, number] {
  if (total <= 1) return [LAYOUT_X.systems, 0, 0];
  const [top, bottom] = SYSTEM_Y_RANGE;
  const y = top - (top - bottom) * (index / (total - 1));
  return [LAYOUT_X.systems, y, 0];
}

export interface AgentNode {
  agent: AgentRow;
  index: number;
  position: [number, number, number];
}

export function buildAgentNodes(): AgentNode[] {
  return AGENTS.map((agent, index) => ({
    agent,
    index,
    position: agentColumnPosition(index, AGENTS.length),
  }));
}

export interface SystemNode {
  system: SystemRow;
  index: number;
  position: [number, number, number];
  isHero: boolean;
  isConvergence: boolean;
  touchCount: number;
  radius: number;
}

export function buildSystemNodes(): SystemNode[] {
  const ordered = orderedSystems();
  const maxTouch = Math.max(...ordered.map((s) => SYSTEM_TOUCH_COUNTS[s.id]), 1);
  return ordered.map((system, index) => {
    const touchCount = SYSTEM_TOUCH_COUNTS[system.id] ?? 0;
    const isHero = system.id === HERO_SYSTEM;
    const norm = touchCount / maxTouch;
    // Hero gets the most prominent (largest) node outright; everyone else
    // scales with how many agents actually touch it — a convergence point
    // reads as physically bigger, not just labeled as one.
    const radius = isHero ? 0.34 : 0.16 + norm * 0.12;
    return {
      system,
      index,
      position: systemColumnPosition(index, ordered.length),
      isHero,
      isConvergence: CONVERGENCE_SYSTEMS.includes(system.id),
      touchCount,
      radius,
    };
  });
}

export interface EdgeLayout {
  agentId: string;
  agentIndex: number;
  agentPosition: [number, number, number];
  systemId: SystemId;
  systemPosition: [number, number, number];
  midPoint: [number, number, number];
  tier: Tier;
  approver?: string;
  note: string;
  // Which of the agent's own writes[] entries this is — check-automations
  // has two distinct writes to PIPELINE_CODE at two different tiers, and
  // both must render as two separate edges, never merged into one.
  writeIndex: number;
}

// Deterministic per-edge jitter (not random — a fixed hash of the indices,
// same "hash the index, don't synchronize" idiom already used for
// per-row shimmer phase offsets elsewhere in this repo) so a dense
// bipartite graph's ~35+ edges don't all collapse into flat, overlapping
// lines between the two columns.
function edgeJitter(agentIndex: number, writeIndex: number): number {
  const h = Math.sin(agentIndex * 12.9898 + writeIndex * 78.233) * 43758.5453;
  return (h - Math.floor(h)) * 2 - 1; // -1..1
}

// Bounding sphere of every agent + system node position (not edges — the
// nodes are what the camera-framing bug (2026-09-14 blind critique: "the
// ambient camera drift regularly frames zero nodes/no hero") is actually
// about). Plain math, no three.js import, same as this file's own
// convention. Camera distance is derived from this in Scene.tsx rather
// than a hand-tuned constant -- a sphere is rotationally symmetric around
// its own center, so a camera positioned at radius >= sphere.radius /
// sin(halfFOV) from that center is guaranteed to keep every node in frame
// at EVERY azimuth/polar angle, not just the one the constant happened to
// be tuned against.
export interface BoundingSphere {
  center: [number, number, number];
  radius: number;
}

export function computeNodeBoundingSphere(): BoundingSphere {
  const positions: [number, number, number][] = [
    ...buildAgentNodes().map((n) => n.position),
    ...buildSystemNodes().map((n) => n.position),
  ];
  // Bounding-BOX midpoint, not a point-average centroid -- caught live:
  // this layout has 29 agent nodes (left column) and only 12 system nodes
  // (right column), so averaging every point's position pulls the
  // "center" toward the denser agent column (computed: x=-1.82, when the
  // two columns actually sit at x=-4.4/+4.4, a true midpoint of x=0). The
  // sphere's whole correctness argument (rotationally symmetric around its
  // OWN center, so a camera at radius >= sphere.radius/sin(halfFOV) sees
  // every node at every angle) only holds if the camera's actual orbit
  // target matches this center -- DriftRig/OrbitControls orbits around the
  // world origin (0,0,0) by default, so this must resolve to (0,0,0) for
  // this layout, not the off-center centroid.
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const [x, y, z] of positions) {
    if (x < min[0]) min[0] = x;
    if (y < min[1]) min[1] = y;
    if (z < min[2]) min[2] = z;
    if (x > max[0]) max[0] = x;
    if (y > max[1]) max[1] = y;
    if (z > max[2]) max[2] = z;
  }
  const center: [number, number, number] = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ];
  let radius = 0;
  for (const [x, y, z] of positions) {
    const d = Math.hypot(x - center[0], y - center[1], z - center[2]);
    if (d > radius) radius = d;
  }
  return { center, radius };
}

export function buildEdges(): EdgeLayout[] {
  const agentNodes = buildAgentNodes();
  const systemNodes = buildSystemNodes();
  const systemPosById = new Map<SystemId, [number, number, number]>(
    systemNodes.map((n) => [n.system.id, n.position])
  );

  const edges: EdgeLayout[] = [];
  agentNodes.forEach(({ agent, index, position: agentPosition }) => {
    agent.writes.forEach((write, writeIndex) => {
      const systemPosition = systemPosById.get(write.system);
      if (!systemPosition) return;
      const jitter = edgeJitter(index, writeIndex);
      const midPoint: [number, number, number] = [
        (agentPosition[0] + systemPosition[0]) / 2,
        (agentPosition[1] + systemPosition[1]) / 2 + jitter * 0.5,
        (agentPosition[2] + systemPosition[2]) / 2 + jitter * 0.9,
      ];
      edges.push({
        agentId: agent.id,
        agentIndex: index,
        agentPosition,
        systemId: write.system,
        systemPosition,
        midPoint,
        tier: write.tier,
        approver: write.approver,
        note: write.note,
        writeIndex,
      });
    });
  });
  return edges;
}
