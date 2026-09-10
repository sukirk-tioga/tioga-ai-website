import { test, expect } from "@playwright/test";

// @vercel/analytics and @vercel/speed-insights only resolve their script
// paths on real Vercel infra — every other environment 404s, which strict
// MIME-type checking turns into a console error. Same stub as
// tests/pages.spec.ts; this file never had it (pre-existing gap, found
// 2026-08-15 while verifying an unrelated /showcase change).
test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

test.describe("2026-08-08 homepage design review changes", () => {
  // Rewritten 2026-09-10: this test originally pinned exact hero headline
  // copy ("...principal responsible for the work...") from the one-time
  // 2026-08-08 design review it's named after. That copy is long gone —
  // the hero has been rewritten multiple times since (most recently again
  // via PR #63/#64's merge-conflict resolution, and separately PR #53) —
  // so the dated assertion had permanently expired and was failing the
  // prod health check every day. `tests/pages.spec.ts` already covers
  // "homepage loads, has a title, no console errors" as an ongoing smoke
  // check, so this is narrowed to the one structural claim from the
  // original review that's still true and still worth checking on an
  // undated basis: the hero always renders exactly 2 CTAs, whatever their
  // copy is. `data-testid="hero-cta-group"` on the CTA wrapper (see
  // HomeHeroPinned.tsx) keeps this decoupled from both copy and layout
  // classes.
  test("hero renders a visible heading and exactly 2 CTAs (desktop)", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();

    // Exactly 2 CTAs in the hero
    await expect(page.getByTestId("hero-cta-group").getByRole("link")).toHaveCount(2);

    await page.screenshot({ path: "/tmp/redesign-hero-desktop.png", fullPage: false });
    expect(errors, `console errors: ${errors.join("; ")}`).toEqual([]);
  });

  test("relocated checklist link and promoted quote render before Try It Right Now", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Not ready to try the demos\?/)).toBeVisible();
    await expect(page.getByText(/See it running, not a slide about it/)).toBeVisible();
  });

  test("pricing section: sprint banner + recommended flag + distinct CTA labels", async ({ page }) => {
    // Navigates straight to the homepage's #services anchor rather than
    // clicking the Nav's "Services" link — as of the 2026-08-16 Nav/Footer
    // consistency fix, Nav "Services" now points to the dedicated /services
    // page (matching the Footer), not this homepage section. This test is
    // about the homepage pricing section's own content, which is unchanged.
    await page.goto("/#services");
    await expect(page.getByText("Not sure where to start?")).toBeVisible();
    await expect(page.getByText("Start here")).toBeVisible();
    await expect(page.getByRole("link", { name: "Scope an assessment" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Check my readiness" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Plan a pilot" })).toBeVisible();
    // old identical-label pattern should be gone
    await expect(page.getByRole("link", { name: "Start a conversation" })).toHaveCount(0);
    await page.screenshot({ path: "/tmp/redesign-pricing-desktop.png", fullPage: false });
  });

  test("nav trimmed to 5 items, MCP/Engineering dropped from top nav", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await expect(nav.getByRole("link", { name: "MCP", exact: true })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Engineering", exact: true })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Solutions" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Services" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Live Demos" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "About" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Contact" })).toBeVisible();
    // still reachable via footer
    await expect(page.locator("footer").getByRole("link", { name: "MCP" })).toBeVisible();
    await expect(page.locator("footer").getByRole("link", { name: "Engineering" })).toBeVisible();
  });

  test("mobile hero renders cleanly, no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({ path: "/tmp/redesign-hero-mobile.png", fullPage: false });
    expect(errors, `console errors: ${errors.join("; ")}`).toEqual([]);
  });
});
