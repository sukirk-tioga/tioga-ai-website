import { test, expect } from "@playwright/test";

// /demos/standing-watch — "The Boundary" 3D scene. Same coverage shape as
// tests/showcase.spec.ts: canvas mounts without throwing, no console
// errors, the deterministic no-WebGL fallback renders, prefers-reduced-
// motion is honored, plus this scene's own DOM interaction (findings list
// + detail panel + Replay button) since that's the primary control surface
// (docs/design/3d-design-standard.md §5.4).

test.beforeEach(async ({ page }) => {
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

  await page.goto("/demos/standing-watch");
  await expect(page.getByTestId("boundary-canvas")).toBeVisible({ timeout: 15_000 });

  // Give the cinematic intro + gate/ribbon/pulse useFrame loops a few
  // frames to run so a throw inside any of them would have fired already.
  await page.waitForTimeout(1500);

  const canvasEl = page.locator('[data-testid="boundary-canvas"] canvas');
  await expect(canvasEl).toHaveCount(1);

  const realErrors = consoleErrors.filter((e) => !e.includes("Extension context invalidated"));
  expect(realErrors, "console errors on /demos/standing-watch").toEqual([]);
});

test("no-WebGL fallback points at the real findings table, not a blank canvas", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error - intentionally narrowing the real signature for the test stub
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "experimental-webgl" || type === "webgl2") return null;
      return original.call(this, type, ...args);
    };
  });

  await page.goto("/demos/standing-watch");

  await expect(page.getByTestId("boundary-fallback")).toBeVisible();
  await expect(page.getByTestId("boundary-canvas")).toHaveCount(0);

  // The real 9-row table (Security-watch section) is still on the page,
  // independent of the 3D scene's own mode.
  const rows = page.locator("table tbody tr");
  await expect(rows).toHaveCount(9);
});

test("prefers-reduced-motion falls back to the table view", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demos/standing-watch");

  await expect(page.getByTestId("boundary-fallback")).toBeVisible();
  await expect(page.getByTestId("boundary-canvas")).toHaveCount(0);
});

test("findings list selects a real row and shows its real detail", async ({ page }) => {
  await page.goto("/demos/standing-watch");
  await expect(page.getByTestId("boundary-interaction")).toBeVisible();

  await page.getByTestId("boundary-finding-item-8").click();
  const detail = page.getByTestId("boundary-finding-detail");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("FileVault is OFF");
  await expect(detail).toContainText("Needs Recovery Mode");
  // The one status:"human" row gets the wall-specific explanatory copy.
  await expect(page.getByText(/stops at the wall instead of landing/)).toBeVisible();

  await page.getByTestId("boundary-finding-item-0").click();
  await expect(detail).toContainText("JARVIS AI gateway had no authentication");
});

test("Replay button starts a playthrough and re-enables when done", async ({ page }) => {
  await page.goto("/demos/standing-watch");
  await expect(page.getByTestId("boundary-canvas")).toBeVisible({ timeout: 15_000 });
  const replayButton = page.getByTestId("boundary-replay-button");
  // canReplay only flips true once BoundaryScene has actually mounted (see
  // BoundaryCanvasLoader.tsx) — real regression this test itself caught
  // pre-fix: clicking before mount silently dropped the signal.
  await expect(replayButton).toBeEnabled({ timeout: 10_000 });

  await replayButton.click();
  // Generous timeout: under heavy parallel test-worker load (each running a
  // full Next server + Chromium instance), the dynamically-imported
  // BoundaryScene chunk + WebGL context can take a few seconds to actually
  // mount even after canReplay flips true — same class of resource
  // contention tests/showcase.spec.ts's own motion test documents at length.
  // The underlying signal is durable regardless of this delay (see Pulses.tsx's
  // lastPlaySignal sentinel fix), so this is a timing budget, not a retry-for-
  // correctness loop.
  await expect(replayButton).toBeDisabled({ timeout: 10_000 });
  await expect(replayButton).toHaveText(/Replaying/);

  // REPLAY_TOTAL_DURATION (boundaryLayout.ts) is ~6.8s (8 * 0.55s stagger +
  // 2.4s travel) + a 0.3s buffer in Pulses' own completion check.
  await expect(replayButton).toBeEnabled({ timeout: 10_000 });
});

test("no page-wide horizontal scroll at mobile width", async ({ page }) => {
  // Regression test: BoundaryInteraction's findings-list buttons overflowed
  // the viewport at narrow widths because a flex child's `truncate` had no
  // `min-w-0` to actually constrain against — caught visually, not by any
  // static check, during this scene's own build. See BoundaryInteraction.tsx.
  await page.setViewportSize({ width: 400, height: 900 });
  await page.goto("/demos/standing-watch");
  await expect(page.getByTestId("boundary-interaction")).toBeVisible();

  const [scrollWidth, clientWidth] = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ]);
  expect(scrollWidth, "page scrollWidth should not exceed viewport width").toBeLessThanOrEqual(clientWidth + 1);
});
