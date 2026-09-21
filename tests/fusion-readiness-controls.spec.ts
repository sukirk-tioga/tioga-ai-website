import { test, expect, type Page } from "@playwright/test";
import {
  GOVERNANCE_CONTROLS,
  controlsPromptLines,
  controlsSystemRules,
  defaultControlSelections,
  parseControlSelections,
  summarizeControls,
} from "../lib/fusion-readiness";

// Three-state governance controls (Present / Absent / Unknown, default
// Unknown) on the Fusion AI-readiness demo. None of these tests needs an LLM
// key or any live model call: the API is mocked in the browser tests, and the
// server tests only send requests that fail validation before the model.

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

const PATH = "/demos/fusion-ai-readiness-assessment";
const API = "/api/demos/fusion-ai-readiness-assessment";

const MOCK_ASSESSMENT = {
  assessment: {
    readinessScore: 3,
    scoreReasoning: "Mock reasoning for the test.",
    keyGaps: [
      { title: "Gap one", detail: "Detail one." },
      { title: "Gap two", detail: "Detail two." },
      { title: "Gap three", detail: "Detail three." },
    ],
    recommendedApproach: { approach: "needs-guardrails", reasoning: "Mock approach reasoning." },
    nextSteps: ["Step one", "Step two"],
  },
  emailed: false,
};

function fieldsets(page: Page) {
  return page.locator("fieldset");
}

test("every control is a fieldset + legend radio group with three labelled radios, defaulting to Unknown", async ({ page }) => {
  await page.goto(PATH);
  const sets = fieldsets(page);
  await expect(sets).toHaveCount(GOVERNANCE_CONTROLS.length);

  for (let i = 0; i < GOVERNANCE_CONTROLS.length; i++) {
    const set = sets.nth(i);
    await expect(set.locator("legend")).toHaveText(GOVERNANCE_CONTROLS[i].label);
    // The group is named by its legend, and each state has a text label.
    await expect(page.getByRole("group", { name: GOVERNANCE_CONTROLS[i].label })).toHaveCount(1);
    await expect(set.getByRole("radio")).toHaveCount(3);
    for (const name of ["Present", "Absent", "Unknown"]) {
      await expect(set.getByRole("radio", { name, exact: true })).toBeVisible();
    }
    await expect(set.getByRole("radio", { name: "Unknown", exact: true })).toBeChecked();
    await expect(set.getByRole("radio", { name: "Present", exact: true })).not.toBeChecked();
    await expect(set.getByRole("radio", { name: "Absent", exact: true })).not.toBeChecked();
  }
  await expect(page.getByTestId("fusion-control-counts")).toContainText("0 Present · 0 Absent · 5 Unknown");
});

test("selecting states is per control and exclusive, and the live counts follow", async ({ page }) => {
  await page.goto(PATH);
  const sets = fieldsets(page);
  await sets.nth(0).getByRole("radio", { name: "Present", exact: true }).check();
  await sets.nth(1).getByRole("radio", { name: "Absent", exact: true }).check();

  await expect(sets.nth(0).getByRole("radio", { name: "Present", exact: true })).toBeChecked();
  await expect(sets.nth(0).getByRole("radio", { name: "Unknown", exact: true })).not.toBeChecked();
  await expect(sets.nth(1).getByRole("radio", { name: "Absent", exact: true })).toBeChecked();
  await expect(sets.nth(2).getByRole("radio", { name: "Unknown", exact: true })).toBeChecked();
  await expect(page.getByTestId("fusion-control-counts")).toContainText("1 Present · 1 Absent · 3 Unknown");

  // Going back to Unknown is possible (it is a real state, not just a default).
  await sets.nth(1).getByRole("radio", { name: "Unknown", exact: true }).check();
  await expect(page.getByTestId("fusion-control-counts")).toContainText("1 Present · 0 Absent · 4 Unknown");
});

test("keyboard: Tab reaches the checked radio, arrow keys move within the group, and the focus ring shows", async ({ page }) => {
  await page.goto(PATH);
  const first = fieldsets(page).nth(0);
  const present = first.getByRole("radio", { name: "Present", exact: true });
  const absent = first.getByRole("radio", { name: "Absent", exact: true });
  const unknown = first.getByRole("radio", { name: "Unknown", exact: true });

  // Three <select>s come first; the group is one Tab stop, on the checked radio.
  await page.getByRole("combobox", { name: "Target agent use case" }).focus();
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  await expect(unknown).toBeFocused();

  // Visible focus indicator from the site-wide :focus-visible rule.
  await expect(unknown).toHaveCSS("outline-style", "solid");
  await expect(unknown).toHaveCSS("outline-width", "2px");

  await page.keyboard.press("ArrowLeft");
  await expect(absent).toBeFocused();
  await expect(absent).toBeChecked();
  await page.keyboard.press("ArrowUp");
  await expect(present).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(absent).toBeChecked();
  await page.keyboard.press("ArrowDown");
  await expect(unknown).toBeChecked();
  // The other groups were not touched by the arrow keys.
  await expect(fieldsets(page).nth(1).getByRole("radio", { name: "Unknown", exact: true })).toBeChecked();

  // Tab leaves the group (does not walk through its radios).
  await page.keyboard.press("Tab");
  await expect(fieldsets(page).nth(1).getByRole("radio", { name: "Unknown", exact: true })).toBeFocused();
});

test("sends three-state controls to the API and shows honest Present / Absent / Unknown counts", async ({ page }) => {
  let sent: Record<string, unknown> | undefined;
  await page.route(`**${API}`, async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_ASSESSMENT) });
  });
  await page.goto(PATH);
  const sets = fieldsets(page);
  await sets.nth(0).getByRole("radio", { name: "Present", exact: true }).check();
  await sets.nth(1).getByRole("radio", { name: "Absent", exact: true }).check();
  await page.getByRole("button", { name: /generate readiness assessment/i }).click();

  await expect(page.getByText("AI-Agent Readiness")).toBeVisible();
  expect(sent?.governanceControls).toEqual({
    roles: "present",
    "api-scope": "absent",
    audit: "unknown",
    approval: "unknown",
    incident: "unknown",
  });

  const counts = page.getByTestId("fusion-result-counts");
  await expect(counts).toContainText("1 Present · 1 Absent · 3 Unknown");
  await expect(counts).toContainText("provisional");
  await expect(counts).toContainText("not counted as missing");

  // Unknown controls are listed as "to confirm", never as gaps.
  const toConfirm = page.getByTestId("fusion-to-confirm").locator("li");
  await expect(toConfirm).toHaveCount(3);
  await expect(toConfirm.first()).toContainText(GOVERNANCE_CONTROLS[2].label);

  // Changing a radio afterwards does not rewrite the result already shown.
  await sets.nth(2).getByRole("radio", { name: "Present", exact: true }).check();
  await expect(counts).toContainText("1 Present · 1 Absent · 3 Unknown");
});

test("all controls confirmed: no provisional caveat and no 'to confirm' list", async ({ page }) => {
  await page.route(`**${API}`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_ASSESSMENT) })
  );
  await page.goto(PATH);
  const sets = fieldsets(page);
  for (let i = 0; i < GOVERNANCE_CONTROLS.length; i++) {
    await sets.nth(i).getByRole("radio", { name: i % 2 === 0 ? "Present" : "Absent", exact: true }).check();
  }
  await page.getByRole("button", { name: /generate readiness assessment/i }).click();
  const counts = page.getByTestId("fusion-result-counts");
  await expect(counts).toContainText("3 Present · 2 Absent · 0 Unknown");
  await expect(counts).not.toContainText("provisional");
  await expect(page.getByTestId("fusion-to-confirm")).toHaveCount(0);
});

test("API rejects malformed control states before any model call", async ({ request }) => {
  const base = {
    useCase: "AP invoice exceptions (Fusion Payables)",
    transactionVolume: "1,000–10,000/month",
    integrationMethod: "No integration yet — planning phase",
  };
  const bodies = [
    { ...base, governanceControls: ["Named incident-response owner for agent actions"] }, // retired array shape
    { ...base, governanceControls: { roles: "maybe" } }, // not a state
    { ...base, governanceControls: { "not-a-control": "present" } }, // not a control id
  ];
  for (const data of bodies) {
    const res = await request.post(API, { data });
    expect(res.status(), JSON.stringify(data.governanceControls)).toBe(400);
    expect((await res.json()).error).toBe("Invalid governance controls selection.");
  }
});

test.describe("prompt rules (pure functions, no model call)", () => {
  const withStates = (over: Record<string, "present" | "absent" | "unknown">) =>
    summarizeControls({ ...defaultControlSelections(), ...over });

  test("parse: default Unknown for omitted ids, strict on everything else", () => {
    expect(parseControlSelections({})).toEqual(defaultControlSelections());
    expect(parseControlSelections({ roles: "absent" })?.roles).toBe("absent");
    expect(parseControlSelections({ roles: "absent" })?.audit).toBe("unknown");
    expect(parseControlSelections(null)).toBeNull();
    expect(parseControlSelections([])).toBeNull();
    expect(parseControlSelections({ roles: true })).toBeNull();
    expect(parseControlSelections({ roles: "Present" })).toBeNull();
  });

  test("all Unknown: never a structural blocker, never 'absent'; listed as unknown and provisional", () => {
    const summary = withStates({});
    const rules = controlsSystemRules(summary);
    expect(rules).toContain("Do NOT call this a structural blocker");
    expect(rules).not.toContain("you MUST explicitly call this a structural blocker");
    expect(rules).toContain("do not give a score of 8 or higher while any control is UNKNOWN");
    expect(rules).toContain("never describe an UNKNOWN control as absent");
    const lines = controlsPromptLines(summary);
    expect(lines).toContain("confirmed PRESENT (in place): none");
    expect(lines).toContain("confirmed ABSENT (confirmed missing): none");
    for (const c of GOVERNANCE_CONTROLS) expect(lines.split("UNKNOWN")[1]).toContain(c.label);
  });

  test("fewer than two Present with a confirmed Absent control: structural blocker, based on Absent only", () => {
    const summary = withStates({ roles: "present", audit: "absent" });
    const rules = controlsSystemRules(summary);
    expect(rules).toContain("you MUST explicitly call this a structural blocker");
    expect(rules).toContain("Do not extend that finding to any UNKNOWN control");
    expect(rules).not.toContain("Do NOT call this a structural blocker");
    const lines = controlsPromptLines(summary);
    expect(lines).toContain(`confirmed ABSENT (confirmed missing): ${GOVERNANCE_CONTROLS[2].label}`);
    expect(lines).toContain(`confirmed PRESENT (in place): ${GOVERNANCE_CONTROLS[0].label}`);
  });

  test("two or more Present: no thin-controls rule; no Unknown: no Unknown rule", () => {
    const summary = withStates({ roles: "present", audit: "present", "api-scope": "absent", approval: "present", incident: "absent" });
    const rules = controlsSystemRules(summary);
    expect(rules).not.toContain("structural blocker");
    expect(rules).not.toContain("earn no credit");
    expect(rules).toContain("no environment should be scored a 10");
  });
});
