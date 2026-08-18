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

test.describe("2026-08-08 hero demo widget (design review item #10)", () => {
  test("renders the sample-run window and cycles through a full field reveal", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    const widget = page.getByTestId("hero-demo");
    await expect(widget.getByText("sample run")).toBeVisible();
    await expect(widget.getByText("invoice_meridian_logistics.pdf")).toBeVisible();

    // Let the animation run through input -> processing -> full output reveal.
    await expect(widget.getByText("Vendor", { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(widget.getByText("Meridian Logistics")).toBeVisible();
    await expect(widget.getByText(/Structured in/)).toBeVisible({ timeout: 5000 });

    await expect(
      widget.getByRole("link", { name: /Run this yourself, with your own file or email/ })
    ).toBeVisible();

    expect(errors, `console errors: ${errors.join("; ")}`).toEqual([]);
  });

  test("honors prefers-reduced-motion by rendering the static output state", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const widget = page.getByTestId("hero-demo");
    await expect(widget.getByText("Vendor", { exact: true })).toBeVisible();
    await expect(widget.getByText("Meridian Logistics")).toBeVisible();
    await expect(widget.getByText(/Structured in 2\.1s/)).toBeVisible();
    await context.close();
  });

  test("demo widget CTA links to the real live demo, not a dead end", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /Run this yourself, with your own file or email/ });
    await expect(link).toHaveAttribute("href", "/demos?tab=invoice");
  });
});
