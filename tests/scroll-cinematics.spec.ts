import { test, expect } from "@playwright/test";

// Homepage scroll cinematics (Phase 4 of the boundary-push plan): pinned
// hero + shader-field rotation + governance-ledger stat count-up, staggered
// scrub reveals on the sections below, and a character-level headline
// reveal. Scope: "/" only.

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

async function collectConsoleErrors(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

test("desktop (1440px): scroll cinematics render and scroll with zero console errors", async ({ page }) => {
  const errors = await collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Scroll through the pinned hero and well into the reveal sections below.
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);

  const realErrors = errors.filter((e) => !e.includes("Extension context invalidated"));
  expect(realErrors, `console errors on / at 1440px: ${realErrors.join("; ")}`).toEqual([]);
});

test("mobile (390px): scroll cinematics render and scroll with zero console errors", async ({ page }) => {
  const errors = await collectConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);

  const realErrors = errors.filter((e) => !e.includes("Extension context invalidated"));
  expect(realErrors, `console errors on / at 390px: ${realErrors.join("; ")}`).toEqual([]);
});

test("headline text survives the SplitText character reveal", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toBeVisible();
  await page.waitForTimeout(1200); // let the one-time SplitText reveal finish
  await expect(h1).toContainText("AI agents for the ERP you already have.");
});

test("stat-strip shows the real governance-ledger numbers at rest, and after scrolling past the pin", async ({ page }) => {
  await page.goto("/");

  // Resting state (no scroll yet): must show the real numbers, never a
  // zeroed/broken-looking stat — see HomeHeroPinned.tsx's
  // COUNT_UP_SCRUB_FRACTION comment.
  await expect(page.getByText("$0.000753")).toBeVisible();
  await expect(page.getByText("2 / 17")).toBeVisible();

  // Scroll well past the pinned range.
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(500);

  // Numbers must settle back to the exact real values, not something the
  // count-up invented.
  await expect(page.getByText("$0.000753")).toBeVisible();
  await expect(page.getByText("17", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("2 / 17")).toBeVisible();
  await expect(page.getByText(/Jul 17.25 2026/)).toBeVisible();
});

test("Lenis and the ScrollTrigger pin are active under normal motion", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);

  const hasLenis = await page.evaluate(() => Boolean((window as unknown as { lenis?: unknown }).lenis));
  expect(hasLenis, "window.lenis should be set once Lenis is instantiated").toBe(true);

  const htmlHasLenisClass = await page.evaluate(() => document.documentElement.classList.contains("lenis"));
  expect(htmlHasLenisClass, "Lenis's own <html class='lenis'> marker").toBe(true);

  await expect(page.locator(".pin-spacer")).toHaveCount(1);
});

test("/#contact deep link lands on the actual Contact section, not short by one pinned hero", async ({ page }) => {
  // Regression test: the hero's pin-spacer adds ~1 viewport height to the
  // document after the browser's native fragment-scroll-on-load already
  // ran against the pre-pin layout, so the first shipped version of this
  // landed on the Process section instead of Contact. Also caught a
  // second bug once the re-scroll was added: Lenis clamps scrollTo's
  // target against a scroll limit cached before the spacer existed,
  // silently landing short again, until lenis.resize() was called first.
  await page.goto("/#contact");
  await page.waitForTimeout(1200);
  const rect = await page.evaluate(() => document.getElementById("contact")?.getBoundingClientRect().top);
  expect(rect, "distance from viewport top to #contact after landing").toBeLessThan(150);
  await expect(page.locator("#contact").getByRole("heading", { name: "Ready to Build?" })).toBeVisible();
});

test("prefers-reduced-motion fully bypasses Lenis and the pin — normal scrolling document", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(500);

  // Lenis must never even be instantiated, not just neutralized.
  const hasLenis = await page.evaluate(() => Boolean((window as unknown as { lenis?: unknown }).lenis));
  expect(hasLenis, "Lenis must not be instantiated under reduced motion").toBe(false);

  // No ScrollTrigger pin-spacer — the hero is never taken out of normal flow.
  await expect(page.locator(".pin-spacer")).toHaveCount(0);

  // Real numbers show immediately, with no count-up ever having run.
  await expect(page.getByText("$0.000753")).toBeVisible();
  await expect(page.getByText("2 / 17")).toBeVisible();

  // The document actually scrolls like a normal page: native scrollTo
  // moves scrollY without any smoothing/pin interception.
  const before = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => window.scrollY);
  expect(after).toBeGreaterThan(before);

  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toContainText("AI agents for the ERP you already have.");
});
