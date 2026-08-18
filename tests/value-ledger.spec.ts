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

// Structural + interaction checks for the live value-ledger panel on the
// AP Exception Workflow demo — no AI calls, no cost, runs on every push/PR.
// Verifies the panel computes live from real session actions, the baseline
// inputs are editable and recompute the total, and the export button
// produces a downloadable report — at both a narrow (390px) and wide
// (1440px) viewport, with zero console errors.

async function runValueLedgerFlow(page: import("@playwright/test").Page) {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );

  await page.goto("/demos/ap-exception-workflow");
  const panel = page.getByTestId("value-ledger-panel");
  await expect(panel.getByText("Value ledger — this session")).toBeVisible();

  // Starts at zero — no actions taken yet. Scoped to the panel since the
  // budget gauge above it can independently read "$0" too.
  await expect(panel.getByText("0.0 hrs")).toBeVisible();
  await expect(panel.getByText("$0")).toBeVisible();

  // Run the auto-approved scenario — should execute and land in the ledger.
  await page.getByRole("button", { name: /1 — Auto-approved/ }).click();
  await expect(page.getByText("executed").first()).toBeVisible({ timeout: 10_000 });

  // Hours saved / value should now be non-zero, computed from the default
  // 14 min baseline and $42/hr rate: (14 - 0.03) * 1 / 60 ≈ 0.2 hrs ≈ $10.
  await expect(panel.getByText("0.2 hrs")).toBeVisible();

  // Editing the baseline recomputes live — bump to 60 min and confirm the
  // hours-saved figure changes accordingly (~1.0 hrs).
  const baselineInput = panel.getByLabel(/Baseline minutes per exception/i);
  await baselineInput.fill("60");
  await expect(panel.getByText("1.0 hrs")).toBeVisible();

  // Run a blocked scenario too, so the totals row is non-trivial.
  await page.getByRole("button", { name: /3 — Blocked \(spend cap\)/ }).click();
  await expect(page.getByText("blocked").first()).toBeVisible({ timeout: 10_000 });
  await expect(panel.getByText("Blocked by policy")).toBeVisible();

  // Export should produce a downloadable HTML report.
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    panel.getByRole("button", { name: /Export session report/i }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("tioga-live-session-value-report.html");

  const realErrors = consoleErrors.filter((e) => !e.includes("Extension context invalidated"));
  expect(realErrors, "console errors on /demos/ap-exception-workflow").toEqual([]);
}

test("value ledger panel computes live and exports — desktop (1440px)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await runValueLedgerFlow(page);
});

test("value ledger panel computes live and exports — mobile (390px)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await runValueLedgerFlow(page);
});
