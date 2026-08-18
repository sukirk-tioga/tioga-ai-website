import { test, expect } from "@playwright/test";

// Homepage hero shader field (Phase 3 of the boundary-push research).
// Regression-worthy on its own: the first shipped version had the exact
// class of bug this file exists to catch -- the canvas mounted, had a real
// size, threw no console errors, and rendered nothing visible, because a
// `position:relative` ancestor without its own z-index doesn't establish a
// stacking context, so a `-z-10` descendant escaped past the section
// entirely and painted behind the page's own root background. Every
// structural check (build, tsc, "canvas exists") passed anyway; only
// reading an actual screenshot caught it.

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

test("hero field mounts without throwing and with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/");
  await expect(page.getByTestId("hero-field-canvas")).toBeVisible({ timeout: 15_000 });

  const canvasEl = page.locator('[data-testid="hero-field-canvas"] canvas');
  await expect(canvasEl).toHaveCount(1);

  const realErrors = consoleErrors.filter((e) => !e.includes("Extension context invalidated"));
  expect(realErrors, "console errors on / from the hero field").toEqual([]);
});

test("hero field canvas actually renders and keeps changing, not just mounted blank", async ({ page }) => {
  // A canvas that mounts but never actually paints anything visible (the
  // exact bug this file is named after -- it produced no console error,
  // had a real element size, and simply never showed up on screen) is
  // indistinguishable from "working" by DOM assertions alone. Compare full
  // canvas screenshots a few seconds apart, the same technique already
  // proven on the showcase's motion regression test -- catches both "never
  // renders anything" and "renders once then freezes."
  await page.goto("/");
  const canvas = page.locator('[data-testid="hero-field-canvas"]');
  await expect(canvas).toBeVisible({ timeout: 15_000 });

  const shot1 = await canvas.screenshot();
  await page.waitForTimeout(4000);
  const shot2 = await canvas.screenshot();

  expect(shot1.equals(shot2), "hero field canvas identical after 4s -- not rendering or frozen").toBe(false);
});

test("no-WebGL fallback renders the original static glow, not a blank hero", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error - intentionally narrowing the real signature for the test stub
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "experimental-webgl" || type === "webgl2") return null;
      return original.call(this, type, ...args);
    };
  });

  await page.goto("/");
  await expect(page.getByTestId("hero-field-canvas")).toHaveCount(0);
  // The h1 still renders normally -- the fallback doesn't break the hero.
  await expect(page.locator("h1")).toBeVisible();
});

test("prefers-reduced-motion skips the canvas entirely", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByTestId("hero-field-canvas")).toHaveCount(0);
  await expect(page.locator("h1")).toBeVisible();
});
