// Free, rules-based self-check on ONE agent-to-ERP/CRM write path. Every
// question is a control point on the write itself (credential, path,
// attribution, policy, approval, verification, rollback, evidence, owner,
// change control) — deliberately not a maturity questionnaire about the
// organization. Authored rules, no model call, nothing leaves the browser.
//
// Scoring principle (same as the Fusion readiness fix, 2026-09-19): an
// unanswered/"Not sure" control is UNCONFIRMED, never counted as exposed.
// "Yes" is self-reported and unaudited — the page says so.

export type Answer = "yes" | "no" | "unsure";

export interface Question {
  id: string;
  /** "core" controls decide the route; the rest inform the gap list. */
  weight: "core" | "supporting";
  ask: string;
  /** Shown when the answer is "No" — why this is an exposure. */
  whyItMatters: string;
  /** Shown when "No" or "Not sure" — the smallest useful next step. */
  firstStep: string;
}

export const QUESTIONS: Question[] = [
  {
    id: "identity",
    weight: "core",
    ask: "Does the agent write with its own dedicated identity — not a shared service account or a human user's credential?",
    whyItMatters:
      "A shared or borrowed credential means the system of record cannot tell an agent's write from a person's, and one leaked credential exposes every workflow that uses it.",
    firstStep: "Issue a dedicated, revocable identity for this agent and inventory who else uses the credential it uses today.",
  },
  {
    id: "least-privilege",
    weight: "supporting",
    ask: "Is that identity limited to the specific objects and actions this workflow needs, rather than a broad role?",
    whyItMatters:
      "A broad role turns a wrong or manipulated instruction into a wrong write anywhere the role reaches, not just in the intended workflow.",
    firstStep: "List the exact objects and actions the workflow performs and cut the role down to that list.",
  },
  {
    id: "app-logic",
    weight: "core",
    ask: "Do writes go through the system's own API or business-logic layer — the same path a human action takes — rather than direct database changes or UI scripting?",
    whyItMatters:
      "Bypassing the application's own validation and posting logic skips the rules the ERP or CRM already enforces, so a write can be accepted that the system itself would have rejected.",
    firstStep: "Identify the one sanctioned application-logic write path for this workflow and route the agent through it.",
  },
  {
    id: "attribution",
    weight: "core",
    ask: "When a record changes, does the system's own audit log show that the agent did it, and on whose behalf?",
    whyItMatters:
      "If the native audit trail records only a generic integration user, an auditor cannot reconstruct who or what authorised a specific change from the system itself.",
    firstStep: "Check one recent agent write in the system's own audit log and see what it actually records about the actor.",
  },
  {
    id: "policy",
    weight: "supporting",
    ask: "Is there a policy check before each write — limits, vendor or account status, period open, duplicates — that can block it?",
    whyItMatters:
      "Without a pre-write check, controls that depend on a person noticing (a held vendor, a closed period, a duplicate) are silently skipped when an agent acts.",
    firstStep: "Write down the three checks a careful human applies before this write and make them a blocking rule.",
  },
  {
    id: "approval",
    weight: "core",
    ask: "Does a write above a defined threshold require a named human approval before it commits?",
    whyItMatters:
      "Without an approval gate, the largest or most unusual writes have the same authority as routine ones, and no named person is accountable for them.",
    firstStep: "Define the threshold and the named approver for it, and make the write wait for that approval.",
  },
  {
    id: "denial",
    weight: "supporting",
    ask: "Is the behaviour defined when an approval is denied or times out — no silent retry, no auto-approve?",
    whyItMatters:
      "An approval gate that fails open on timeout or retries after denial is not a gate; the undefined case is where these controls usually break.",
    firstStep: "Specify denial and timeout outcomes explicitly (stop, escalate, or expire) and test each one.",
  },
  {
    id: "verification",
    weight: "supporting",
    ask: "After a write, does something re-read the system state and confirm it matches what was intended?",
    whyItMatters:
      "A success response from an API is not proof the record ended up correct; without a read-back, partial or wrong writes are found later by someone else.",
    firstStep: "Add a read-back step that compares the resulting record with the intended change and flags any difference.",
  },
  {
    id: "rollback",
    weight: "supporting",
    ask: "Is there a tested way to reverse a wrong write (a reversal entry, void, or restore)?",
    whyItMatters:
      "An untested rollback is a plan, not a control; the first real wrong write is a bad time to discover it does not work.",
    firstStep: "Run one deliberate wrong write in a sandbox and reverse it end to end.",
  },
  {
    id: "evidence",
    weight: "supporting",
    ask: "For any single write, can you produce one record showing what was proposed, which policy ran, who approved it, and what happened?",
    whyItMatters:
      "Auditors and control owners ask for the story of one transaction. If it has to be pieced together from several systems, it usually cannot be reproduced on demand.",
    firstStep: "Pick one write from last month and try to assemble that record; note every gap.",
  },
  {
    id: "owner",
    weight: "supporting",
    ask: "Is there a named person accountable for this agent's write access, with a review date and the authority to revoke it?",
    whyItMatters:
      "Agent access with no owner outlives the project that created it and is rarely reviewed.",
    firstStep: "Name an owner, set a review cadence, and record how access is revoked.",
  },
  {
    id: "change-control",
    weight: "supporting",
    ask: "Is a change to the agent's instructions, tools, or model reviewed before it can change what the agent is allowed to write?",
    whyItMatters:
      "A prompt or tool change can quietly widen what the agent does; if changes are not reviewed, yesterday's approval no longer describes today's agent.",
    firstStep: "Put agent instruction, tool, and model changes through the same review as a permission change.",
  },
];

export const ACCESS_PATHS = [
  "An ERP/CRM's own built-in agent",
  "An MCP server or API gateway",
  "Direct API credentials",
  "RPA or UI automation",
  "Not decided yet",
] as const;

export const TARGET_SYSTEMS = [
  "Oracle Fusion Cloud",
  "Oracle E-Business Suite",
  "SAP",
  "Workday",
  "Salesforce",
  "ServiceNow",
  "QuickBooks / NetSuite / other",
  "Not decided yet",
] as const;

export type RouteId = "fit-check" | "sprint" | "standing-watch";

export interface Route {
  id: RouteId;
  name: string;
  price: string;
  href: string;
  reason: string;
}

export interface ExposureResult {
  total: number;
  covered: number;
  exposed: number;
  unconfirmed: number;
  /** Ordered: core gaps first. */
  exposedQuestions: Question[];
  unconfirmedQuestions: Question[];
  coreExposed: number;
  band: "high" | "moderate" | "low" | "unclear";
  route: Route;
  /** True when several core write-path controls are exposed. */
  suggestDiagnostic: boolean;
}

const ROUTES: Record<RouteId, Omit<Route, "reason">> = {
  "fit-check": { id: "fit-check", name: "AI Fit Check", price: "$1,500 · one day", href: "/ai-fit-check" },
  sprint: { id: "sprint", name: "Discovery Sprint", price: "$5,000 · five days", href: "/discovery-sprint" },
  "standing-watch": {
    id: "standing-watch",
    name: "Standing Watch Assessment",
    price: "$15–35K · 3–4 weeks",
    href: "/solutions/standing-watch",
  },
};

export function scoreExposure(answers: Record<string, Answer | undefined>): ExposureResult {
  const exposedQuestions: Question[] = [];
  const unconfirmedQuestions: Question[] = [];
  let covered = 0;

  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a === "yes") covered += 1;
    else if (a === "no") exposedQuestions.push(q);
    else unconfirmedQuestions.push(q); // "Not sure" and unanswered are never counted as exposed
  }

  const byWeight = (a: Question, b: Question) => (a.weight === b.weight ? 0 : a.weight === "core" ? -1 : 1);
  exposedQuestions.sort(byWeight);
  unconfirmedQuestions.sort(byWeight);

  const total = QUESTIONS.length;
  const exposed = exposedQuestions.length;
  const unconfirmed = unconfirmedQuestions.length;
  const coreExposed = exposedQuestions.filter((q) => q.weight === "core").length;

  let band: ExposureResult["band"];
  // Known gaps outrank unknowns: enough confirmed-missing controls make the
  // exposure high regardless of how many other controls are unconfirmed.
  if (coreExposed >= 3 || exposed >= 6) band = "high";
  else if (unconfirmed >= 5) band = "unclear";
  else if (exposed >= 1) band = "moderate";
  else band = "low";

  let route: Route;
  if (coreExposed >= 3) {
    // Enough is already known to be missing that more discovery isn't needed
    // first, even if other controls are unconfirmed.
    route = {
      ...ROUTES.sprint,
      reason:
        "Several core write-path controls are known to be missing, so there is enough to scope. A five-day Sprint builds a working, governed version of one write path on a read-only sandbox or scoped sample data, plus a delivery plan.",
    };
  } else if (unconfirmed >= 4) {
    route = {
      ...ROUTES["fit-check"],
      reason:
        "Too many of these controls are unconfirmed to say where the write path stands. A one-day, written proceed / revise / stop call is the cheapest way to find out before committing more.",
    };
  } else if (exposed >= 1) {
    route = {
      ...ROUTES.sprint,
      reason:
        "You know what is missing and have a bounded workflow. A five-day Sprint builds a working, governed version of one write path on a read-only sandbox or scoped sample data, plus a delivery plan.",
    };
  } else {
    route = {
      ...ROUTES["standing-watch"],
      reason:
        "You reported the write-path controls in place. The next question is whether they hold: independent, fixed-cadence verification and one evidence record across the systems involved.",
    };
  }

  return {
    total,
    covered,
    exposed,
    unconfirmed,
    exposedQuestions,
    unconfirmedQuestions,
    coreExposed,
    band,
    route,
    suggestDiagnostic: coreExposed >= 3,
  };
}
