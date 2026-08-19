// Deterministic, rules-based mapping — not a model call. Same discipline as
// the EU AI Act Readiness Calculator (app/trust/eu-ai-act/calculator) and the
// capital-equipment-order/ap-exception-workflow demos' policy.ts files:
// authored logic against a published framework, run entirely in the browser.
//
// Framework being mapped: Gartner's four-tier AI-agent autonomy model
// (Observe / Advise / Act with Approval / Act Autonomously), from the
// press release "Applying Uniform Governance Across AI Agents Will Lead to
// Enterprise AI Agent Failure" (2026-05-26, analyst Shiva Varma). Gartner's
// own newsroom page 403'd to automated fetch during research; this mapping
// and the quotes/paraphrases below were verified via CIO Dive's
// corroborating coverage, not read directly from Gartner's original text —
// see the citation copy in page.tsx, which carries the same hedge forward
// for site visitors. Source: ~/SecondBrain/TiogaAI/research/
// showcase-ideas-research-2026-08-18.md

export type GartnerTierId = "observe" | "advise" | "act_with_approval" | "act_autonomously";
export type TiogaTierId = "safe" | "ask_first" | "never";

export interface GartnerTier {
  id: GartnerTierId;
  label: string;
  short: string;
  description: string;
}

export const GARTNER_TIERS: Record<GartnerTierId, GartnerTier> = {
  observe: {
    id: "observe",
    label: "Observe",
    short: "Reads and summarizes — baseline controls",
    description:
      "The agent only reads and summarizes information. It doesn't recommend or take any action, so Gartner's framework places it under baseline controls — visibility and logging, not approval gates.",
  },
  advise: {
    id: "advise",
    label: "Advise",
    short: "Recommends — output-quality review",
    description:
      "The agent recommends an action, but a human decides and carries out the actual work separately. Gartner's framework calls for output-quality review here — checking that the recommendation itself is sound — not action-gating controls, since the agent never touches the system of record.",
  },
  act_with_approval: {
    id: "act_with_approval",
    label: "Act with Approval",
    short: "Communication/configuration — meaningful human control",
    description:
      "The agent prepares or stages an action — a communication, a configuration change — but it doesn't take effect until a human signs off. Gartner's framework calls this \"meaningful human control\": the agent does real work, but every instance still passes through a person before it's final.",
  },
  act_autonomously: {
    id: "act_autonomously",
    label: "Act Autonomously",
    short: "Independent execution — heaviest guardrails, human sampling",
    description:
      "The agent executes the action itself, with no person reviewing that specific instance. Gartner's framework says this tier needs the heaviest guardrails of the four — and still calls for periodic human sampling of what the agent did, not zero oversight.",
  },
};

export interface TiogaTier {
  id: TiogaTierId;
  label: string;
  short: string;
}

export const TIOGA_TIERS: Record<TiogaTierId, TiogaTier> = {
  safe: {
    id: "safe",
    label: "Safe",
    short: "Do this without asking",
  },
  ask_first: {
    id: "ask_first",
    label: "Ask-first",
    short: "Propose it, get a named approver",
  },
  never: {
    id: "never",
    label: "Never",
    short: "No execution path — not with approval, not this way",
  },
};

export type Stakes = "low" | "high";

export interface MappingResult {
  tiogaTier: TiogaTierId;
  why: string;
}

// The core mapping. Observe/Advise never write anything, so they're always
// Safe. Act with Approval is Ask-first by construction — Gartner defines
// that tier as "every instance passes through a human," which is exactly
// what Tioga's Ask-first bucket means. Act Autonomously is the one tier
// that needs more than the headline label to place correctly, because
// Gartner itself says it still needs "the heaviest guardrails" — so two
// follow-up questions (self-approval conflict, and stakes/reversibility)
// decide whether that heaviest-guardrail version is Tioga's Safe (a
// narrow, pre-vetted, reversible action — the same shape the
// capital-equipment-order demo auto-executes), Ask-first (currently
// ungoverned and high-stakes — needs the approval checkpoint reinstated),
// or Never (the agent can propose AND finalize/authorize its own action
// with nobody else ever in the loop — a structural conflict, not a stakes
// question, matching the scope-check "no execution path" shape the
// capital-equipment-order and ap-exception-workflow demos already use for
// out-of-bounds action types).
export function mapToTiogaTier(
  gartnerTier: GartnerTierId,
  opts: { selfApprovalConflict: boolean; stakes: Stakes }
): MappingResult {
  if (gartnerTier === "observe") {
    return {
      tiogaTier: "safe",
      why: "No write action exists to gate — the agent only reads and reports. Standard access/visibility controls apply, not action-gating ones.",
    };
  }
  if (gartnerTier === "advise") {
    return {
      tiogaTier: "safe",
      why: "The agent's output is a recommendation only; a human decides and performs the actual action separately, so there's nothing for a Safe/Ask-first/Never policy to gate on the agent's side.",
    };
  }
  if (gartnerTier === "act_with_approval") {
    return {
      tiogaTier: "ask_first",
      why: "By definition, this action doesn't take effect until a named human signs off on that specific instance — that is exactly Tioga's Ask-first shape, the same pattern the AP-exception and capital-equipment-order demos gate a material price delta or a formal reject through.",
    };
  }

  // act_autonomously
  if (opts.selfApprovalConflict) {
    return {
      tiogaTier: "never",
      why: "The same agent identity can both propose and finalize/authorize this action, with no separate approver ever in the loop. That's a structural conflict, not a question of stakes — no execution path should exist until the two roles are separated, the same \"no path to execute it, governed or otherwise\" shape the demos use for an out-of-scope action type.",
    };
  }
  if (opts.stakes === "high") {
    return {
      tiogaTier: "ask_first",
      why: "Gartner's own guidance is that the Act Autonomously tier still needs the heaviest guardrails of the four — for an action with real financial, contractual, or compliance stakes, that means putting a named-approver checkpoint back in front of it, not running it fully unattended. As described, this use case is currently ungoverned; Ask-first is the redesign, not a verdict that it's fine as-is.",
    };
  }
  return {
    tiogaTier: "safe",
    why: "Narrow, pre-vetted, and reversible if it's wrong — this is the specific case Tioga's Safe tier is built for: genuinely fine to automate end-to-end, with logging and periodic review standing in for Gartner's \"human sampling,\" not a per-instance approval.",
  };
}

// ── Preset example use cases ────────────────────────────────────────────────
// Three worked examples grounded in the task brief's own SAP/Oracle-relevant
// examples; "custom" (no preset id) walks the visitor through the same
// three questions by hand.

export interface Preset {
  id: string;
  label: string;
  description: string;
  gartnerTier: GartnerTierId;
  selfApprovalConflict: boolean;
  stakes: Stakes;
}

export const PRESETS: Preset[] = [
  {
    id: "pr-draft",
    label: "Drafts purchase requisitions",
    description:
      "The agent prepares a PR against a vendor and cost center, but a named procurement owner has to sign off before it's submitted.",
    gartnerTier: "act_with_approval",
    selfApprovalConflict: false,
    stakes: "high",
  },
  {
    id: "so-finalize",
    label: "Finalizes sales order configurations",
    description:
      "The agent replaces a placeholder (TBD) material with the final configured material and commits it — no per-instance human check today.",
    gartnerTier: "act_autonomously",
    selfApprovalConflict: false,
    stakes: "high",
  },
  {
    id: "reporting-qa",
    label: "Answers reporting questions",
    description:
      "The agent reads data from the ERP/warehouse and answers a question or produces a summary — it doesn't write anything back.",
    gartnerTier: "observe",
    selfApprovalConflict: false,
    stakes: "low",
  },
];

// ── Gartner citation copy, hedged per the research file's own sourcing note ─

export const GARTNER_SOURCE_NOTE =
  "Gartner, \"Applying Uniform Governance Across AI Agents Will Lead to Enterprise AI Agent Failure\" (press release, May 26, 2026; analyst Shiva Varma). Gartner's own newsroom page returned a fetch error when checked directly for this demo, so this is sourced to CIO Dive's corroborating coverage of that release, not to Gartner's original text — treat it as analyst-attributed but secondary-sourced until you've read Gartner's release yourself.";

export const GARTNER_STAT_NOTE =
  "Gartner's own related finding, same press release: by 2027, 40% of enterprises are predicted to demote or decommission autonomous AI agents — because governance gaps surface only after a production incident, not before, when the same uniform policy is applied regardless of an agent's autonomy level. Same secondary-sourcing hedge as above applies.";
