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
  test("hero headline, subhead, and reduced CTAs render correctly (desktop)", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "AI agents for the ERP you already have."
    );
    await expect(page.getByText(/No migration required/)).toBeVisible();
    await expect(page.getByText(/click the chat bubble/)).toHaveCount(0);

    // Exactly 2 CTAs in the hero now
    await expect(page.getByRole("link", { name: "Book a 20-minute fit call" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See an AP agent run" })).toBeVisible();

    await page.screenshot({ path: "/tmp/redesign-hero-desktop.png", fullPage: false });
    expect(errors, `console errors: ${errors.join("; ")}`).toEqual([]);
  });

  test("relocated checklist link and promoted quote render before Try It Right Now", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Not ready to try the demos\?/)).toBeVisible();
    await expect(page.getByText(/I don.t have client logos to show you yet/)).toBeVisible();
  });

  test("pricing section: sprint banner + recommended flag + distinct CTA labels", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Services" }).first().click();
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
