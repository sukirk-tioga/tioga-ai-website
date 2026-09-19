import { test, expect } from "@playwright/test";

// Regression guards for the claims-narrowing / inventory half of the
// 2026-09-19 website review (Codex review, triaged by a Fable 5.1
// adversarial pass): universal competitor claims scoped, propose-only
// language matched to the automation-oversight demo, HR demos reflected in
// the Solutions inventory, and internal sales vocabulary kept off buyer pages.

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

test("Solutions inventory lists the HR demos as live and procurement as not built", async ({ page }) => {
  await page.goto("/solutions");
  // Workflow rows live inside collapsed disclosures, so assert on the DOM
  // (textContent) rather than on visibility.
  const hr = page.locator('a[href="/demos/timecard-exception-shadow-mode"]', { hasText: "HR & workforce workflows" });
  await expect(hr).toHaveCount(1);
  const text = (await page.locator("body").textContent()) ?? "";
  expect(text).toContain("Procurement workflows");
  expect(text).not.toMatch(/HR & procurement workflows are not yet built/);
});

test("governed-write-path no longer makes universal competitor claims", async ({ page }) => {
  await page.goto("/solutions/governed-write-path");
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/every .AI for ERP. pitch/i);
  expect(body).not.toMatch(/Every AI-agent vendor can show you a read/);
});

test("standing-watch landing page scopes its platform and propose-only claims", async ({ page }) => {
  await page.goto("/lp/standing-watch");
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/None of them govern the aggregate/);
  expect(body).not.toMatch(/No automation ever writes to live configuration/);
  expect(body).toMatch(/None of the four governs the aggregate/);
});

for (const route of ["/ai-fit-check", "/discovery-sprint"]) {
  test(`${route} keeps internal sales vocabulary off the buyer page`, async ({ page }) => {
    await page.goto(route);
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/\bprospects?\b/i);
    expect(body).not.toMatch(/qualification economics/i);
    expect(body).not.toMatch(/only delivery capacity/i);
  });
}

test("standing-watch landing page cites its third-party stats with dated source links", async ({ page }) => {
  await page.goto("/lp/standing-watch");
  await expect(page.getByRole("link", { name: /SAP News Center, Aug 3, 2026/ })).toHaveAttribute(
    "href",
    /news\.sap\.com\/2026\/08\/agent-sprawl/
  );
  await expect(page.getByRole("link", { name: /SD Times coverage/ })).toHaveAttribute("href", /sdtimes\.com/);
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/OutSystems, 1,900 IT leaders/);
});
