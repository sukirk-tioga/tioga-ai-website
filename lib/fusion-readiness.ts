// Shared by the Fusion AI-readiness demo's page (client) and its API route
// (server). No server-only imports here: the page renders these labels, the
// route validates against them and builds the prompt from them, so the two
// can never drift apart (before this file the page and the route each kept
// their own label list, and the "approval" label had already diverged).
//
// Each control is one of three states, not a checkbox:
//   present -- the user confirmed it is in place
//   absent  -- the user confirmed it is missing (the only state that can
//              support a "missing control" / structural-blocker finding)
//   unknown -- the user could not confirm either way (the default). NEVER
//              described as absent or missing; listed as "to confirm".

export const CONTROL_STATES = ["present", "absent", "unknown"] as const;
export type ControlState = (typeof CONTROL_STATES)[number];

export const CONTROL_STATE_LABELS: Record<ControlState, string> = {
  present: "Present",
  absent: "Absent",
  unknown: "Unknown",
};

export const GOVERNANCE_CONTROLS = [
  { id: "roles", label: "Agent-scoped security roles (not just seeded Fusion roles)" },
  { id: "api-scope", label: "REST API access scoped to specific endpoints, not broad admin access" },
  { id: "audit", label: "Structured audit trail exported to a governance/audit system" },
  { id: "approval", label: "Human-approval rules extended to agent-initiated actions, not just human-initiated ones" },
  { id: "incident", label: "Named incident-response owner for agent actions" },
] as const;

export type ControlId = (typeof GOVERNANCE_CONTROLS)[number]["id"];
export type ControlSelections = Record<ControlId, ControlState>;

export function defaultControlSelections(): ControlSelections {
  return Object.fromEntries(GOVERNANCE_CONTROLS.map((c) => [c.id, "unknown"])) as ControlSelections;
}

export interface ControlSummary {
  present: string[]; // control labels
  absent: string[];
  unknown: string[];
}

export function summarizeControls(selections: ControlSelections): ControlSummary {
  const out: ControlSummary = { present: [], absent: [], unknown: [] };
  for (const c of GOVERNANCE_CONTROLS) out[selections[c.id]].push(c.label);
  return out;
}

/**
 * Strict validation of the request field. Accepts only a plain object whose
 * keys are known control ids and whose values are one of the three states.
 * A control id that is omitted is treated as "unknown" (never as absent).
 * Returns null for anything else, including the retired array-of-labels
 * shape, so nothing outside the enums can reach the prompt.
 */
export function parseControlSelections(input: unknown): ControlSelections | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
  const ids = new Set<string>(GOVERNANCE_CONTROLS.map((c) => c.id));
  const states = new Set<string>(CONTROL_STATES);
  const selections = defaultControlSelections();
  for (const [key, value] of Object.entries(input)) {
    if (!ids.has(key) || typeof value !== "string" || !states.has(value)) return null;
    selections[key as ControlId] = value as ControlState;
  }
  return selections;
}

const list = (labels: string[]) => (labels.length > 0 ? labels.join("; ") : "none");

/** The control lines of the user prompt. */
export function controlsPromptLines(summary: ControlSummary): string {
  return [
    `- Governance controls confirmed PRESENT (in place): ${list(summary.present)}`,
    `- Governance controls confirmed ABSENT (confirmed missing): ${list(summary.absent)}`,
    `- Governance controls UNKNOWN (the user could not confirm either way; NOT absent): ${list(summary.unknown)}`,
  ].join("\n");
}

/**
 * The system-prompt rules for the three states, including the conditional
 * "thin controls" rule. Fewer than two PRESENT controls is only a
 * "structural blocker" when at least one control is confirmed ABSENT to
 * support it; fewer than two present with nothing confirmed absent (i.e.
 * Unknown alone) must not be called a structural blocker or a failing result.
 */
export function controlsSystemRules(summary: ControlSummary): string {
  const thin = summary.present.length < 2;
  const hasAbsent = summary.absent.length > 0;
  const hasUnknown = summary.unknown.length > 0;

  const thinRule = !thin
    ? "Note any remaining governance gap even where several controls are already confirmed present — no environment should be scored a 10 on selected controls alone."
    : hasAbsent
      ? "Fewer than two governance controls are confirmed present AND at least one is confirmed ABSENT: you MUST explicitly call this a structural blocker to any autonomous (non-human-gated) agent action in the risks or reasoning, not a minor gap, and name the confirmed-ABSENT control(s) as the basis. Do not extend that finding to any UNKNOWN control."
      : "Fewer than two governance controls are confirmed present, but none is confirmed ABSENT. Do NOT call this a structural blocker and do not describe any control as missing: nothing has been shown to be missing. Instead state that readiness cannot yet be established from this form, that any autonomous (non-human-gated) agent action should stay human-gated until the UNKNOWN controls are confirmed, and that the score is provisional.";

  const rules = [
    "Control states: PRESENT means the user confirmed the control is in place. ABSENT means the user confirmed it is missing; only ABSENT controls may be described as missing, absent, or a gap in the environment. UNKNOWN means the user could not confirm either way; never describe an UNKNOWN control as absent, missing, lacking, or failing — call it \"not confirmed\".",
    thinRule,
  ];
  if (hasUnknown) {
    rules.push(
      "UNKNOWN controls earn no credit and no penalty: do not lower the score because a control is UNKNOWN, and do not give a score of 8 or higher while any control is UNKNOWN (readiness is not established). State in scoreReasoning that the score is provisional and reflects only the confirmed controls. Include a nextSteps entry to confirm the UNKNOWN controls, and if an UNKNOWN control appears in keyGaps, title it as \"not yet confirmed\" rather than as a missing control. Choose recommendedApproach \"not-ready\" only when confirmed ABSENT controls support it, never on UNKNOWN controls alone."
    );
  }
  return rules.join("\n- ");
}
