import { test, expect, type Page } from "@playwright/test";

// Free exposure check (2026-09-19 competitive decision): rules-based, all in
// the browser. Key behaviours guarded here: "Not sure" is never counted as
// exposed (the same rule as the Fusion readiness fix), the route follows the
// counts, and nothing is sent to a server.

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

async function answerAll(page: Page, label: "Yes" | "No" | "Not sure") {
  const groups = page.getByRole("radiogroup");
  const n = await groups.count();
  expect(n).toBe(12);
  for (let i = 0; i < n; i++) {
    await groups.nth(i).getByRole("radio", { name: label, exact: true }).click();
  }
}

test("all 'Not sure' is reported as unconfirmed, never as exposed, and routes to the Fit Check", async ({ page }) => {
  await page.goto("/demos/agent-write-path-exposure-check");
  await answerAll(page, "Not sure");
  await page.getByRole("button", { name: "See my exposure read" }).click();
  const result = page.getByTestId("wpec-result");
  await expect(result.getByText("Exposure unclear")).toBeVisible();
  await expect(page.getByTestId("wpec-count-exposed")).toHaveText("0");
  await expect(page.getByTestId("wpec-count-unconfirmed")).toHaveText("12");
  await expect(result.getByRole("heading", { name: "AI Fit Check" })).toBeVisible();
});

test("all 'No' shows high exposure, lists core gaps, and suggests the write-path diagnostic", async ({ page }) => {
  await page.goto("/demos/agent-write-path-exposure-check");
  await answerAll(page, "No");
  await page.getByRole("button", { name: "See my exposure read" }).click();
  const result = page.getByTestId("wpec-result");
  await expect(result.getByText("High exposure")).toBeVisible();
  await expect(page.getByTestId("wpec-count-exposed")).toHaveText("12");
  await expect(result.getByRole("heading", { name: "Discovery Sprint" })).toBeVisible();
  await expect(result.getByRole("link", { name: /Agent-Ready ERP Diagnostic/ })).toBeVisible();
});

test("all 'Yes' is a self-report, low exposure, routed to independent verification", async ({ page }) => {
  await page.goto("/demos/agent-write-path-exposure-check");
  await answerAll(page, "Yes");
  await page.getByRole("button", { name: "See my exposure read" }).click();
  const result = page.getByTestId("wpec-result");
  await expect(result.getByText("Low reported exposure")).toBeVisible();
  await expect(result.getByRole("heading", { name: "Standing Watch Assessment" })).toBeVisible();
  await expect(result.getByText(/self-report, not a verification/)).toBeVisible();
});

test("makes no network request when answering and scoring", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (req) => {
    if (req.method() !== "GET") posts.push(`${req.method()} ${req.url()}`);
  });
  await page.goto("/demos/agent-write-path-exposure-check");
  await answerAll(page, "No");
  await page.getByRole("button", { name: "See my exposure read" }).click();
  await expect(page.getByTestId("wpec-result")).toBeVisible();
  expect(posts, "non-GET requests made by the check").toEqual([]);
});

test("fits a 390px phone without sideways scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demos/agent-write-path-exposure-check");
  await answerAll(page, "No");
  await page.getByRole("button", { name: "See my exposure read" }).click();
  await expect(page.getByTestId("wpec-result")).toBeVisible();
  const { doc, vw } = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, vw: window.innerWidth }));
  expect(doc).toBeLessThanOrEqual(vw);
});

test("known core gaps outweigh unknowns: 3+ core 'No' routes to the Sprint even with many 'Not sure'", async ({ page }) => {
  await page.goto("/demos/agent-write-path-exposure-check");
  const groups = page.getByRole("radiogroup");
  // Questions 1, 3, 4 (identity, application-logic path, attribution) are core.
  for (const i of [0, 2, 3]) await groups.nth(i).getByRole("radio", { name: "No", exact: true }).click();
  for (const i of [1, 4, 5, 6, 7, 8]) await groups.nth(i).getByRole("radio", { name: "Not sure", exact: true }).click();
  await page.getByRole("button", { name: "See my exposure read" }).click();
  const result = page.getByTestId("wpec-result");
  await expect(result.getByText("High exposure")).toBeVisible();
  await expect(page.getByTestId("wpec-count-unconfirmed")).toHaveText("9");
  await expect(result.getByRole("heading", { name: "Discovery Sprint" })).toBeVisible();
});
