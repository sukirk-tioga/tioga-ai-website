// Pure layout + copy-derivation helpers for the Checkpoint Walk scene —
// mirrors the role of agent-reach-map/registerLayout.ts: no React, no
// three.js imports, independently testable in Node against
// lib/agent-register.ts alone.
//
// Composition (per the task spec): agent tile (left) -> Gate (center, the
// same checkpoint metaphor as app/showcase's Gate) -> system (right).
// Unlike the Reach Map's full 29-agent bipartite graph, only the currently
// selected agent's write edge(s) render at a time — the DOM agent list
// (Interaction.tsx) is the primary control, same accessibility pattern as
// the Reach Map (docs/design/3d-design-standard.md §5.4 lineage).
import {
  AGENTS,
  SYSTEMS,
  DISPOSITIONS,
  type AgentRow,
  type WriteEdge,
  type SystemId,
  type SystemRow,
  type DispositionEvent,
} from "../../../lib/agent-register";

export const LANE_X = { agent: -4.2, gate: 0, system: 4.2 };

// A write edge carries no positional info of its own — z-lane spread keeps
// a 2-write agent (e.g. check-automations, both writes targeting
// PIPELINE_CODE at two different tiers) from rendering both edges as one
// overlapping line. Every agent in the real register has at most 2 writes,
// so this only ever spreads across 1 or 2 lanes.
export function laneZ(writeIndex: number, totalWrites: number): number {
  if (totalWrites <= 1) return 0;
  const spread = 1.1;
  const step = spread / (totalWrites - 1);
  return spread / 2 - writeIndex * step;
}

export function agentTilePosition(writeIndex: number, totalWrites: number): [number, number, number] {
  return [LANE_X.agent, 0, laneZ(writeIndex, totalWrites)];
}

export function systemNodePosition(writeIndex: number, totalWrites: number): [number, number, number] {
  return [LANE_X.system, 0, laneZ(writeIndex, totalWrites)];
}

// Every lane's curve passes through this exact same point at its local
// midpoint — one physical Gate, geometrically load-bearing for every lane
// at once (3d-design-standard.md §2.1/§2.3), not a decorative label.
export const GATE_POSITION: [number, number, number] = [LANE_X.gate, 0, 0];

// The "Replay real findings" lane is offset vertically (not in Z) so it
// never visually collides with whichever agent/write the visitor currently
// has selected, while still converging on the exact same Gate position
// above. A Z offset was tried first and didn't reliably separate on screen
// — this scene's camera (DriftRig, CAMERA_FROM/CAMERA_TO in Scene.tsx)
// looks mostly along the Z axis, so a Z-only offset reads as depth/fog, not
// lateral separation, at most azimuth angles in its narrow auto-orbit
// range. A Y offset survives that camera's elevation reliably, and reads
// as a nice bonus: every lane visibly arcs up through the exact same Gate
// point regardless of which row it started on.
export const REPLAY_LANE_Y = -1.7;
export const REPLAY_AGENT_POSITION: [number, number, number] = [LANE_X.agent, REPLAY_LANE_Y, 0];
export const REPLAY_SYSTEM_POSITION: [number, number, number] = [LANE_X.system, REPLAY_LANE_Y, 0];

export function systemRow(id: SystemId): SystemRow {
  return SYSTEMS.find((s) => s.id === id) ?? { id, name: id, description: "" };
}

export function findAgent(agentId: string): AgentRow | undefined {
  return AGENTS.find((a) => a.id === agentId);
}

export interface WriteLane {
  write: WriteEdge;
  writeIndex: number;
  totalWrites: number;
}

export function agentWrites(agent: AgentRow): WriteLane[] {
  return agent.writes.map((write, writeIndex) => ({ write, writeIndex, totalWrites: agent.writes.length }));
}

// A default selection that shows off the scene's full range on first load
// (rest state should carry meaning without a click — 3d-design-standard.md
// §2.4's "design the rest state first"): check-automations is the one real
// agent with both an agent-owned write AND a human-supervised write to the
// same system, so the corridor is populated with both lane types at once
// before the visitor does anything.
export const DEFAULT_AGENT_ID = "check-automations";

// --- Honest, per-tier copy — every sentence traces directly to a real
// write edge's own `note`/`approver` field (task spec: "derive exact
// wording from that edge's real note field, don't invent generic copy").
export function crossingCopy(write: WriteEdge): string {
  return `No approval gate — this write lands automatically. ${write.note}`;
}

export function pausedApproverLabel(write: WriteEdge): string {
  return write.approver ?? "No named approver on record for this edge";
}

export function approveCopy(): string {
  return "This is what approval looks like for this real, already-established review requirement — not a live approval happening right now.";
}

export function timeoutCopy(): string {
  return "This write does not land without that review. There's no documented fail-closed timeout duration for this edge in the register, so none is shown or implied here.";
}

export function advisoryOnlyCopy(write: WriteEdge): string {
  return `This isn't a write with a gate to cross — it's an email alert. There's nothing here to authorize. ${write.note}`;
}

export function noWritesCopy(agent: AgentRow): string {
  return `${agent.name} has no write edges in the register — it only reads${
    agent.reads.length ? ` ${agent.reads.map((r) => systemRow(r).name).join(", ")}` : " nothing"
  }.`;
}

// --- Replay (real, dated DISPOSITIONS, not composite) --------------------
//
// DISPOSITIONS only carries day-granularity `date` fields, not timestamps —
// there is no real sub-day gap to derive spacing from (see
// lib/agent-register.ts's own header comment on this array).
// REPLAY_STEP_SECONDS is therefore a declared, fixed UI pacing choice, not
// a claim about real timing — the page copy labels it as such
// (docs/design/3d-design-standard.md §3.2).
export const REPLAY_STEP_SECONDS = 1.5;
export const REPLAY_TRAVEL_LEG_SECONDS = 1.0;
export const REPLAY_APPROVED_PAUSE_SECONDS = 0.6;

export function replayEventDuration(event: DispositionEvent): number {
  return event.disposition === "auto-implemented"
    ? REPLAY_TRAVEL_LEG_SECONDS * 2
    : REPLAY_TRAVEL_LEG_SECONDS * 2 + REPLAY_APPROVED_PAUSE_SECONDS;
}

export const REPLAY_START_OFFSETS: number[] = DISPOSITIONS.map((_, i) => i * REPLAY_STEP_SECONDS);

export const REPLAY_TOTAL_SECONDS =
  REPLAY_START_OFFSETS[REPLAY_START_OFFSETS.length - 1] +
  replayEventDuration(DISPOSITIONS[DISPOSITIONS.length - 1]);

// --- Interactive walk timing (also a declared UI pacing choice, not a
// claim about any real duration) -------------------------------------
export const WALK_LEG_SECONDS = 1.3;
export const GATE_CROSS_WINDOW = 0.06;
