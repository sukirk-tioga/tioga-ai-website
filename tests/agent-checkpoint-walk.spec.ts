import { test, expect } from "@playwright/test";
import { AGENTS, DISPOSITIONS } from "../lib/agent-register";

// /demos/agent-checkpoint-walk — "The Checkpoint Walk" 3D scene. Cloned
// from tests/agent-reach-map.spec.ts's pattern (mounts clean, no-WebGL
// fallback, canvas motion regression, reduced-motion fallback) plus the
// task spec's own five interaction-specific cases: an agent-owned walk
// crosses without any button prompt, a human-supervised walk shows the
// real approver and requires an interactive choice, a human-owned
// selection shows no pulse and the explanatory copy, and Replay plays all
// 7 real dispositions.

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

  await page.goto("/demos/agent-checkpoint-walk");
  await expect(page.getByTestId("agent-checkpoint-walk-canvas")).toBeVisible({ timeout: 15_000 });

  // Give the scene a couple of animation frames to run (the default
  // check-automations selection's two static lanes, the Gate's breathing
  // halo/scan ring) so a throw inside useFrame would actually have fired
  // before we assert.
  await page.waitForTimeout(1000);

  const canvasEl = page.locator('[data-testid="agent-checkpoint-walk-canvas"] canvas');
  await expect(canvasEl).toHaveCount(1);

  const realErrors = consoleErrors.filter((e) => !e.includes("Extension context invalidated"));
  expect(realErrors, "console errors on /demos/agent-checkpoint-walk").toEqual([]);
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

  await page.goto("/demos/agent-checkpoint-walk");

  const fallback = page.getByTestId("agent-checkpoint-walk-fallback-table");
  await expect(fallback).toBeVisible();
  await expect(page.getByTestId("agent-checkpoint-walk-canvas")).toHaveCount(0);

  // Real data, not a placeholder: one row per real write edge, plus one row
  // per agent with zero writes — same rows the interactive scene lets you
  // walk, covering all 29 real agents (task spec: "the list must cover all
  // 29 real agents, not a curated subset").
  const expectedRows = AGENTS.reduce((sum, a) => sum + Math.max(a.writes.length, 1), 0);
  const rows = fallback.locator("tbody tr");
  await expect(rows).toHaveCount(expectedRows);
});

test("canvas keeps changing over time — motion regression test", async ({ page }) => {
  // Same class of check as agent-reach-map.spec.ts's own motion regression
  // test (docs/design/3d-design-standard.md §4.1): a scene can pass every
  // structural check and still be a single static frame. 4+ timestamps
  // spread over >=15s, per §4.1's own minimum bar. Skipped in CI for the
  // same documented reason showcase.spec.ts's equivalent test is
  // (GPU-less CI runner's screenshot round-trips grow unboundedly under
  // sustained per-frame WebGL work) -- run manually with a real GPU after
  // any change to the render loop, DriftRig config, or camera code.
  test.skip(!!process.env.CI, "GPU-less CI runner can't execute this check reliably — run manually with a real GPU after render-loop changes");

  test.setTimeout(45_000);
  await page.goto("/demos/agent-checkpoint-walk");
  const canvas = page.locator('[data-testid="agent-checkpoint-walk-canvas"]');
  const fallback = page.getByTestId("agent-checkpoint-walk-fallback-table");

  await expect(canvas.or(fallback)).toBeVisible({ timeout: 15_000 });
  if (await fallback.isVisible()) {
    test.skip(true, "WebGL context lost mid-test — fallback rendered correctly, not a freeze regression");
    return;
  }

  const shot1 = await canvas.screenshot();
  await page.waitForTimeout(2200);
  const shot2 = await canvas.screenshot();
  await page.waitForTimeout(4000);
  const shot3 = await canvas.screenshot();
  await page.waitForTimeout(6000);
  const shot4 = await canvas.screenshot();

  expect(shot1.equals(shot2), "canvas identical after 2.2s — motion stalled immediately").toBe(false);
  expect(shot2.equals(shot3), "canvas identical after a further 4s — motion froze partway through").toBe(false);
  expect(shot3.equals(shot4), "canvas identical after a further 6s (>=15s total) — motion froze partway through").toBe(false);
});

test("prefers-reduced-motion falls back to the table", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demos/agent-checkpoint-walk");

  const fallback = page.getByTestId("agent-checkpoint-walk-fallback-table");
  await expect(fallback).toBeVisible();
  await expect(page.getByTestId("agent-checkpoint-walk-canvas")).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
});

test("agent-owned walk crosses without a button prompt", async ({ page }) => {
  // automation-wake-guard's one write is agent-owned (SYSTEM_POWER, no
  // approver) — a good specific target since a naive implementation that
  // always showed Approve/timeout buttons would visibly fail this.
  await page.goto("/demos/agent-checkpoint-walk");
  await expect(page.getByTestId("agent-checkpoint-walk-canvas")).toBeVisible({ timeout: 15_000 });

  const agent = AGENTS.find((a) => a.id === "automation-wake-guard")!;
  await page.getByTestId(`agent-item-${agent.id}`).click();

  const crossingCopy = page.getByTestId("checkpoint-crossing-copy");
  await expect(crossingCopy).toBeVisible();
  await expect(crossingCopy).toContainText(agent.writes[0].note);

  await page.getByTestId("start-walk-button").click();

  // Sampled mid-transit and again well after the full ~2.6s crossing
  // duration -- the Approve/timeout buttons must never appear for an
  // agent-owned edge.
  await page.waitForTimeout(1200);
  await expect(page.getByTestId("approve-button")).toHaveCount(0);
  await expect(page.getByTestId("timeout-button")).toHaveCount(0);

  await page.waitForTimeout(2000);
  await expect(page.getByTestId("approve-button")).toHaveCount(0);
  await expect(page.getByTestId("timeout-button")).toHaveCount(0);
});

test("human-supervised walk shows the real approver and requires an interactive choice", async ({ page }) => {
  // check-automations' second write is human-supervised, approver
  // "Sukir (founder review)" — real data, not invented copy.
  await page.goto("/demos/agent-checkpoint-walk");
  await expect(page.getByTestId("agent-checkpoint-walk-canvas")).toBeVisible({ timeout: 15_000 });

  const agent = AGENTS.find((a) => a.id === "check-automations")!;
  const writeIndex = agent.writes.findIndex((w) => w.tier === "human-supervised");
  // check-automations is the scene's own default selection (populates the
  // rest state with both a real agent-owned AND human-supervised lane at
  // once) — it's already selected on load, so clicking its list item here
  // would toggle it *off* (same select/deselect toggle semantics as
  // agent-reach-map's list). Only the write-edge row needs a click.
  await page.getByTestId(`write-item-${agent.id}-${writeIndex}`).click();

  await page.getByTestId("start-walk-button").click();

  // Leg 1 (agent -> gate) is 1.3s -- wait through it, then the panel must
  // show the real approver and both buttons before anything can proceed.
  const paused = page.getByTestId("checkpoint-paused-at-gate");
  await expect(paused).toBeVisible({ timeout: 4_000 });
  await expect(paused.locator(`text=${agent.writes[writeIndex].approver}`)).toBeVisible();
  await expect(page.getByTestId("approve-button")).toBeVisible();
  await expect(page.getByTestId("timeout-button")).toBeVisible();

  await page.getByTestId("approve-button").click();
  await expect(paused).toHaveCount(0);
});

test("human-owned selection shows no pulse and the explanatory copy", async ({ page }) => {
  // check-launchd-status's one write is human-owned (SMTP_EMAIL, an
  // alert-only edge) -- no "Start walk" trigger should ever render for it.
  await page.goto("/demos/agent-checkpoint-walk");
  await expect(page.getByTestId("agent-checkpoint-walk-canvas")).toBeVisible({ timeout: 15_000 });

  const agent = AGENTS.find((a) => a.id === "check-launchd-status")!;
  await page.getByTestId(`agent-item-${agent.id}`).click();

  const advisoryCopy = page.getByTestId("checkpoint-advisory-copy");
  await expect(advisoryCopy).toBeVisible();
  await expect(advisoryCopy).toContainText("There's nothing here to authorize");
  await expect(advisoryCopy).toContainText(agent.writes[0].note);

  await expect(page.getByTestId("start-walk-button")).toHaveCount(0);
  await expect(page.getByTestId("approve-button")).toHaveCount(0);
  await expect(page.getByTestId("timeout-button")).toHaveCount(0);
});

test("Replay real findings plays all 7 real dispositions", async ({ page }) => {
  test.setTimeout(30_000);
  await page.goto("/demos/agent-checkpoint-walk");
  await expect(page.getByTestId("agent-checkpoint-walk-canvas")).toBeVisible({ timeout: 15_000 });

  expect(DISPOSITIONS.length).toBe(7);

  await page.getByTestId("replay-findings-button").click();
  await expect(page.getByTestId("replay-complete")).toBeVisible({ timeout: 20_000 });

  const logItems = page.getByTestId("replay-log");
  await expect(logItems.locator("li")).toHaveCount(7);

  // Spot-check the real first/last dated findings actually appear, not a
  // placeholder count.
  await expect(page.getByTestId("replay-log-item-0")).toContainText(DISPOSITIONS[0].date);
  await expect(page.getByTestId("replay-log-item-6")).toContainText(DISPOSITIONS[6].date);
});
