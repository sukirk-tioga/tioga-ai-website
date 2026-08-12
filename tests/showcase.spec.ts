import { test, expect } from "@playwright/test";

// /showcase — "The Oversight Plane" 3D scene. Covers the four things the
// Phase 1 plan calls out explicitly: the canvas mounts without throwing,
// there are no console errors, the deterministic no-WebGL fallback renders
// the real table, and prefers-reduced-motion is honored (canvas AND the
// hero image/video path).

test.beforeEach(async ({ page }) => {
  // Same stub as tests/pages.spec.ts — @vercel/analytics and
  // @vercel/speed-insights only resolve on real Vercel infra.
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

  await page.goto("/showcase");
  await expect(page.getByTestId("showcase-canvas")).toBeVisible({ timeout: 15_000 });

  // Give the scene a couple of animation frames to run (instance matrix
  // updates, budget-aperture pulse) so a throw inside useFrame would
  // actually have fired before we assert.
  await page.waitForTimeout(1000);

  const canvasEl = page.locator('[data-testid="showcase-canvas"] canvas');
  await expect(canvasEl).toHaveCount(1);

  const realErrors = consoleErrors.filter((e) => !e.includes("Extension context invalidated"));
  expect(realErrors, "console errors on /showcase").toEqual([]);
});

test("DOM legend and provenance strip show the real, corrected figures", async ({ page }) => {
  await page.goto("/showcase");

  // The corrected 12/17 (not the draft plan's wrong 15/17) free-$0 figure,
  // and the same $0.000753 / $30.00 spend-vs-cap figure as the table page.
  await expect(page.getByText("12", { exact: false }).first()).toBeVisible();
  await expect(page.locator("text=/12.*of those.*71%.*settle at exactly \\$0/")).toBeVisible();
  await expect(page.locator("text=/\\$0\\.000753/")).toBeVisible();
  await expect(page.locator("text=/\\$30\\.00/").first()).toBeVisible();
});

test("no-WebGL fallback renders the real table", async ({ page }) => {
  // Force detectWebGL() to fail before any app JS runs.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error - intentionally narrowing the real signature for the test stub
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "experimental-webgl" || type === "webgl2") return null;
      // @ts-expect-error - forwarding to the original implementation
      return original.call(this, type, ...args);
    };
  });

  await page.goto("/showcase");

  const fallback = page.getByTestId("showcase-fallback-table");
  await expect(fallback).toBeVisible();
  await expect(page.getByTestId("showcase-canvas")).toHaveCount(0);

  // Real data, not a placeholder: 17 rows, header row not counted.
  const rows = fallback.locator("tbody tr");
  await expect(rows).toHaveCount(17);
  await expect(fallback.locator("text=/\\$0\\.000002/")).toBeVisible();
});

test("prefers-reduced-motion falls back to the table and the hero stays a static image", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/showcase");

  const fallback = page.getByTestId("showcase-fallback-table");
  await expect(fallback).toBeVisible();
  await expect(page.getByTestId("showcase-canvas")).toHaveCount(0);

  // Phase 1's hero is a captured still, not a video loop (the motion-loop
  // capture is Phase 2 scope) - so there is no autoplaying <video> element
  // for reduced-motion to suppress; assert that's actually true rather
  // than assuming it, and that the still image is present and non-empty.
  await expect(page.locator("video")).toHaveCount(0);
  const heroImg = page.locator('img[alt*="Oversight Plane"]');
  await expect(heroImg).toBeVisible();
  await expect(heroImg).toHaveAttribute("src", /.+/);
});
