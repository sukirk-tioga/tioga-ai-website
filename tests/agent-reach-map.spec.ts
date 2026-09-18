import { test, expect } from "@playwright/test";
import { buildEdges } from "../app/demos/agent-reach-map/registerLayout";
import { AGENTS, UNSUPERVISED_WRITE_COUNT } from "../lib/agent-register";

// /demos/agent-reach-map — "The Reach Map" 3D scene. Cloned from
// tests/showcase.spec.ts's five-test pattern (mounts clean, DOM figures,
// no-WebGL fallback, canvas keeps changing, reduced-motion fallback) plus
// three more from the task spec: click/keyboard selection updates the
// panel from real data, the unsupervised-writes-only toggle isolates the
// real derived count, and the fallback table's row count equals
// AGENTS.length.

test.beforeEach(async ({ page }) => {
  // Same stub as tests/pages.spec.ts / showcase.spec.ts — @vercel/analytics
  // and @vercel/speed-insights only resolve on real Vercel infra.
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

test("canvas mounts without throwing and with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/demos/agent-reach-map");
  await expect(page.getByTestId("agent-reach-map-canvas")).toBeVisible({ timeout: 15_000 });

  // Give the scene a couple of animation frames to run (instance matrix
  // updates, edge shimmer, the hero system's scan ring) so a throw inside
  // useFrame would actually have fired before we assert.
  await page.waitForTimeout(1000);

  const canvasEl = page.locator('[data-testid="agent-reach-map-canvas"] canvas');
  await expect(canvasEl).toHaveCount(1);

  const realErrors = consoleErrors.filter((e) => !e.includes("Extension context invalidated"));
  expect(realErrors, "console errors on /demos/agent-reach-map").toEqual([]);
});

test("DOM provenance strip shows the real, derived figures", async ({ page }) => {
  await page.goto("/demos/agent-reach-map");

  // STATS in lib/agent-register.ts is computed from AGENTS/SYSTEMS, not
  // hand-typed -- this asserts the page renders those same values, not a
  // hardcoded copy that could drift.
  await expect(page.locator(`text=/${AGENTS.length}/`).first()).toBeVisible();
  await expect(page.locator(`text=/${UNSUPERVISED_WRITE_COUNT}/`).first()).toBeVisible();
});

test("no-WebGL fallback renders the real table", async ({ page }) => {
  // Force detectWebGL() to fail before any app JS runs.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error - intentionally narrowing the real signature for the test stub
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "experimental-webgl" || type === "webgl2") return null;
      return original.call(this, type, ...args);
    };
  });

  await page.goto("/demos/agent-reach-map");

  const fallback = page.getByTestId("agent-reach-map-fallback-table");
  await expect(fallback).toBeVisible();
  await expect(page.getByTestId("agent-reach-map-canvas")).toHaveCount(0);

  // Real data, not a placeholder: one row per real agent, header row not
  // counted -- also test (c) from the task spec.
  const rows = fallback.locator("tbody tr");
  await expect(rows).toHaveCount(AGENTS.length);
});

test("canvas keeps changing over time — motion regression test", async ({ page }) => {
  // Same class of check as showcase.spec.ts's autoRotate-freeze regression
  // test (docs/design/3d-design-standard.md §4.1/§4.2): a scene can pass
  // every structural check and still be a single static frame. Skipped in
  // CI for the same documented reason showcase.spec.ts's equivalent test
  // is (GPU-less CI runner's screenshot round-trips grow unboundedly under
  // sustained per-frame WebGL work) -- run manually with a real GPU after
  // any change to the render loop, DriftRig config, or camera code.
  test.skip(!!process.env.CI, "GPU-less CI runner can't execute this check reliably — run manually with a real GPU after render-loop changes");

  test.setTimeout(45_000);
  await page.goto("/demos/agent-reach-map");
  const canvas = page.locator('[data-testid="agent-reach-map-canvas"]');
  const fallback = page.getByTestId("agent-reach-map-fallback-table");

  await expect(canvas.or(fallback)).toBeVisible({ timeout: 15_000 });
  if (await fallback.isVisible()) {
    test.skip(true, "WebGL context lost mid-test — fallback rendered correctly, not a freeze regression");
    return;
  }

  const shot1 = await canvas.screenshot();
  await page.waitForTimeout(2500);
  const shot2 = await canvas.screenshot();
  await page.waitForTimeout(6000);
  const shot3 = await canvas.screenshot();

  expect(shot1.equals(shot2), "canvas identical after 2.5s — motion stalled immediately").toBe(false);
  expect(shot2.equals(shot3), "canvas identical after a further 6s — motion froze partway through").toBe(false);
});

test("prefers-reduced-motion falls back to the table", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demos/agent-reach-map");

  const fallback = page.getByTestId("agent-reach-map-fallback-table");
  await expect(fallback).toBeVisible();
  await expect(page.getByTestId("agent-reach-map-canvas")).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
});

test("clicking an agent in the DOM list updates the detail panel to match its real register data", async ({ page }) => {
  await page.goto("/demos/agent-reach-map");
  await expect(page.getByTestId("agent-reach-map-canvas")).toBeVisible({ timeout: 15_000 });

  // "check-automations" is the one real agent with two writes to the same
  // system at two different tiers (lib/agent-register.ts) -- a good
  // specific target since a naive implementation that merged its writes
  // would visibly fail this assertion.
  const agent = AGENTS.find((a) => a.id === "check-automations")!;
  await page.getByTestId(`agent-item-${agent.id}`).click();

  const panel = page.getByTestId("reach-map-agent-detail");
  await expect(panel).toBeVisible();
  await expect(panel.locator(`text=${agent.name}`)).toBeVisible();
  await expect(panel.locator(`text=${agent.blastRadius}`)).toBeVisible();
  // Both real write edges for this agent must render as distinct entries,
  // not merged into one.
  await expect(panel.locator("text=Agent-owned (unsupervised)")).toBeVisible();
  await expect(panel.locator("text=Human-supervised")).toBeVisible();
});

test("keyboard arrow navigation moves focus through the agent list", async ({ page }) => {
  await page.goto("/demos/agent-reach-map");
  await expect(page.getByTestId("agent-reach-map-canvas")).toBeVisible({ timeout: 15_000 });

  const first = page.getByTestId(`agent-item-${AGENTS[0].id}`);
  const second = page.getByTestId(`agent-item-${AGENTS[1].id}`);

  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(second).toBeFocused();

  await second.press("Enter");
  const panel = page.getByTestId("reach-map-agent-detail");
  await expect(panel).toBeVisible();
  await expect(panel.locator(`text=${AGENTS[1].name}`)).toBeVisible();
});

test('"unsupervised writes only" toggle isolates exactly the real agent-owned edge count', async ({ page }) => {
  // Data-level check: what the scene renders at full brightness when the
  // toggle is on is exactly UNSUPERVISED_WRITE_COUNT edges -- buildEdges()
  // is the same pure function Scene.tsx's EdgeTubes renders from, and its
  // tier field is read from real lib/agent-register.ts write edges.
  const unsupervisedEdges = buildEdges().filter((e) => e.tier === "agent-owned");
  expect(unsupervisedEdges.length).toBe(UNSUPERVISED_WRITE_COUNT);

  // Runtime check: the toggle is a real control that changes the rendered
  // canvas, not dead UI.
  await page.goto("/demos/agent-reach-map");
  const canvas = page.locator('[data-testid="agent-reach-map-canvas"]');
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(800);

  const toggle = page.getByTestId("unsupervised-toggle");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  const before = await canvas.screenshot();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(500);
  const after = await canvas.screenshot();

  expect(before.equals(after), "canvas pixels unchanged after toggling unsupervised-only view").toBe(false);
});

test("fallback table row count equals the real agent count", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demos/agent-reach-map");
  const fallback = page.getByTestId("agent-reach-map-fallback-table");
  await expect(fallback).toBeVisible();
  await expect(fallback.locator("tbody tr")).toHaveCount(AGENTS.length);
  expect(AGENTS.length).toBe(29);
});
