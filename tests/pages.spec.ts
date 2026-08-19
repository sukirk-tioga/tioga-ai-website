import { test, expect } from "@playwright/test";

// Structural checks only — no AI calls, no cost, runs on every push/PR.
// Catches broken pages, broken nav, and the "every page has the same
// <title>" SEO regression found during the 2026-07-27 audit.

const PAGES = [
  { path: "/", title: "Tioga AI — Governed AI Agents for Oracle and SAP" },
  { path: "/services", title: "Services — Tioga AI" },
  { path: "/mcp", title: "MCP Integrations — Tioga AI" },
  { path: "/mcp/vs-custom-integration", title: "MCP vs. Custom Integration — Tioga AI" },
  { path: "/mcp/vs-rpa", title: "MCP vs. RPA — Tioga AI" },
  { path: "/demos", title: "Live AI Demos — Tioga AI" },
  { path: "/demos/governance-ledger", title: "Governance Ledger Demo — Tioga AI" },
  { path: "/demos/ap-exception-workflow", title: "Governed AP Exception Workflow Demo — Tioga AI" },
  { path: "/demos/capital-equipment-order", title: "Governed Capital Equipment Order Booking Demo — Tioga AI" },
  { path: "/demos/field-service-classification", title: "Governed Field Service Billable Classification Demo — Tioga AI" },
  { path: "/demos/erp-reporting-copilot", title: "ERP Reporting Copilot Demo — Tioga AI" },
  { path: "/demos/migration-assessment", title: "Migration Assessment Demo — Tioga AI" },
  { path: "/demos/agent-autonomy-mapper", title: "Agent Autonomy Tier Mapper — Tioga AI" },
  { path: "/about", title: "About — Tioga AI" },
  { path: "/contact", title: "Contact — Tioga AI" },
  { path: "/trust", title: "Trust & Governance — Tioga AI" },
  { path: "/trust/eu-ai-act", title: "EU AI Act Exposure — Tioga AI" },
  { path: "/trust/eu-ai-act/calculator", title: "EU AI Act Readiness Calculator — Tioga AI" },
  { path: "/trust/framework-mapping", title: "NIST AI RMF ↔ ISO 42001 ↔ EU AI Act Mapping — Tioga AI" },
  { path: "/engineering", title: "How We Built It — Tioga AI" },
  { path: "/engineering/invoice-processing", title: "How We Built the Invoice Processing Demo — Tioga AI" },
  { path: "/engineering/email-triage", title: "How We Built the Email Triage Demo — Tioga AI" },
  { path: "/engineering/migration-assessment", title: "How We Built the Migration Assessment Demo — Tioga AI" },
  { path: "/showcase", title: "The Gateway Corridor — Tioga AI" },
  { path: "/changelog", title: "Build Log — Tioga AI" },
  { path: "/samples/discovery-sprint-scope.html", title: "Sample: 5-Day Discovery Sprint Scope — Tioga AI" },
  { path: "/samples/governance-evidence-excerpt.html", title: "Sample: Governance Evidence Excerpt — Tioga AI" },
  { path: "/samples/ai-governance-executive-summary.html", title: "Sample: AI Governance Readiness — Executive Summary — Tioga AI" },
  { path: "/samples/weekly-value-report.html", title: "Sample: Weekly Value Report — Tioga AI" },
  { path: "/articles", title: "Articles — Tioga AI" },
  { path: "/articles/governed-write-path-pattern", title: "How a Governed AI Write-Path Actually Works — Tioga AI" },
  { path: "/articles/framework-mapping-not-three-checklists", title: "NIST AI RMF vs. ISO 42001 vs. EU AI Act: One Mapping, Not Three Checklists — Tioga AI" },
  { path: "/articles/mcp-scoped-permissions", title: "MCP Integration Still Needs Approval Gates — Tioga AI" },
  { path: "/articles/migration-complexity-scoring", title: "What Actually Drives Oracle EBS to S/4HANA Migration Complexity — Tioga AI" },
  { path: "/articles/ai-cost-governance-ledger", title: "What a Real AI Cost-Governance Ledger Looks Like — Tioga AI" },
  { path: "/articles/ap-exception-auto-approve-antipattern", title: "Why 'Auto-Approve Everything Under $X' Is an AP Governance Anti-Pattern — Tioga AI" },
];

for (const { path, title } of PAGES) {
  test(`${path} loads, has correct title, no console errors`, async ({ page }) => {
    // @vercel/analytics's and @vercel/speed-insights's scripts only resolve
    // on real Vercel infra (they're served by the platform, not this app) —
    // every non-Vercel environment (this CI runner, local `next start`)
    // 404s on them, which the X-Content-Type-Options: nosniff header then
    // turns into a second "refused to execute" console error. Stub both so
    // the assertion below still catches real regressions instead of this
    // permanent false positive (confirmed 2026-08-09: broke the suite the
    // moment Analytics was added, then again the moment Speed Insights was
    // added — same root cause, different package).
    await page.route("**/_vercel/insights/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
    );
    await page.route("**/_vercel/speed-insights/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
    );

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    const response = await page.goto(path);
    expect(response?.status(), `${path} should return 200`).toBe(200);
    await expect(page).toHaveTitle(title);

    // Filter out noise that isn't a real regression (e.g. third-party
    // extension warnings) — tighten this list if it gets too permissive.
    const realErrors = consoleErrors.filter(
      (e) => !e.includes("Extension context invalidated")
    );
    expect(realErrors, `console errors on ${path}`).toEqual([]);
  });
}

test("nav links resolve to real destinations", async ({ page }) => {
  await page.goto("/");
  const navLinks = page.locator("nav a[href]");
  const hrefs = await navLinks.evaluateAll((els) =>
    els.map((el) => el.getAttribute("href")).filter(Boolean)
  );
  expect(hrefs.length).toBeGreaterThan(0);

  for (const href of hrefs as string[]) {
    if (href.startsWith("mailto:") || href.startsWith("http")) continue;
    const target = href.startsWith("/#") ? "/" : href.split("#")[0] || "/";
    const response = await page.request.get(target);
    expect(response.status(), `nav link ${href} -> ${target}`).toBe(200);
  }
});

test("footer links resolve to real destinations", async ({ page }) => {
  await page.goto("/");
  const footerLinks = page.locator("footer a[href]");
  const hrefs = await footerLinks.evaluateAll((els) =>
    els.map((el) => el.getAttribute("href")).filter(Boolean)
  );

  for (const href of hrefs as string[]) {
    if (href.startsWith("mailto:") || href.startsWith("http")) continue;
    const target = href.startsWith("/#") ? "/" : href.split("#")[0] || "/";
    const response = await page.request.get(target);
    expect(response.status(), `footer link ${href} -> ${target}`).toBe(200);
  }
});

test("SEO files are present and well-formed", async ({ page }) => {
  const robots = await page.request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap:");

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain("<urlset");
  expect(sitemapBody).toContain("<loc>https://tioga.ai/</loc>");

  const og = await page.request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toBe("image/png");
});

test("homepage has unique per-page OG/Twitter metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /.+/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image"
  );
});
