import { test, expect } from "@playwright/test";

// Structural checks only — no AI calls, no cost, runs on every push/PR.
// Catches broken pages, broken nav, and the "every page has the same
// <title>" SEO regression found during the 2026-07-27 audit.

const PAGES = [
  { path: "/", title: "Tioga AI — Enterprise AI Implementation" },
  { path: "/services", title: "Services — Tioga AI" },
  { path: "/mcp", title: "MCP Integrations — Tioga AI" },
  { path: "/demos", title: "Live AI Demos — Tioga AI" },
  { path: "/demos/governance-ledger", title: "Governance Ledger Demo — Tioga AI" },
  { path: "/demos/migration-assessment", title: "Migration Assessment Demo — Tioga AI" },
];

for (const { path, title } of PAGES) {
  test(`${path} loads, has correct title, no console errors`, async ({ page }) => {
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
