import { test, expect } from "@playwright/test";

// 2026-09-19 competitive decisions: the evidence map and the vendor-evidence
// article. Guards the honesty constraints as much as the content: the map
// must carry its scope disclaimers, must not cite ISO 42001 control numbers
// (only themes), and the article must call Forrester a prediction.

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

test("evidence map covers all six stages with NIST and EU references and its scope disclaimers", async ({ page }) => {
  await page.goto("/trust/evidence-map");
  const body = await page.locator("body").innerText();
  for (const stage of ["Read", "Propose", "Approve or deny", "Commit (the write)", "Roll back", "Change the agent"]) {
    expect(body.toLowerCase()).toContain(stage.toLowerCase());
  }
  for (const ref of ["MAP 3.5", "GOVERN 2.1", "MEASURE 2.4", "MANAGE 2.4", "MANAGE 4.1", "Art. 12(1)", "Art. 14(4)(d)", "Art. 26(6)"]) {
    expect(body, ref).toContain(ref);
  }
  expect(body).toMatch(/conceptual map, not a certification/);
  expect(body).toMatch(/high-risk AI systems/);
  expect(body).toMatch(/Tioga AI is not ISO 42001 certified/);
  // ISO 42001 is cited by theme only — no Annex A control numbers.
  expect(body).not.toMatch(/\bA\.\d+\.\d+/);
});

test("evidence map fits a 390px phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trust/evidence-map");
  const { doc, vw } = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, vw: window.innerWidth }));
  expect(doc).toBeLessThanOrEqual(vw);
});

test("vendor-evidence article cites its primary sources and calls Forrester a prediction", async ({ page }) => {
  await page.goto("/articles/vendor-governance-is-vendor-evidence");
  await expect(page.getByRole("link", { name: /third-party MCP access to SAP solutions/ })).toHaveAttribute(
    "href",
    "https://architecture.learning.sap.com/docs/ref-arch/137800"
  );
  await expect(page.getByRole("link", { name: /Predictions 2026/ })).toHaveAttribute("href", /forrester\.com/);
  const body = await page.locator("body").innerText();
  expect(body).toMatch(/It is a prediction, dated November 2025/);
  expect(body).toMatch(/not yet fully addressed/);
  expect(body).not.toMatch(/\bcan.t ship\b|will never|cannot govern/i);
  await expect(page.getByRole("link", { name: "agent action evidence map", exact: true })).toHaveAttribute("href", "/trust/evidence-map");
});
