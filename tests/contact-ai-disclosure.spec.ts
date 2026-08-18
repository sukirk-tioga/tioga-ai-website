import { test, expect } from "@playwright/test";

// AI-disclosure line on the homepage contact form (agentic-business-ops
// master plan §5.1 item 0.5 — EU AI Act Article 50 requires disclosure
// before or at the very start of an interaction with an AI system). Checks
// the disclosure actually renders, and that it links to the /trust#ai-use
// statement rather than duplicating it, at both a mobile (390px) and a
// desktop (1440px) viewport, with zero console errors either way.

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

const VIEWPORTS = [
  { name: "mobile (390px)", size: { width: 390, height: 844 } },
  { name: "desktop (1440px)", size: { width: 1440, height: 900 } },
];

for (const { name, size } of VIEWPORTS) {
  test(`contact-form AI disclosure renders with no console errors — ${name}`, async ({ page }) => {
    await page.setViewportSize(size);

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    // Updated 2026-08-18: the contact form moved from the homepage's inline
    // #contact section to its own /contact page (contact-page-build) --
    // SmartContactForm (and this disclosure) moved with it, unchanged.
    await page.goto("/contact");

    const disclosure = page.getByText(
      /This form is processed by an AI system \(Claude\) that classifies your inquiry/
    );
    await expect(disclosure).toBeVisible();

    const trustLink = page.getByRole("link", { name: "how we use AI on this site" });
    await expect(trustLink).toBeVisible();
    await expect(trustLink).toHaveAttribute("href", "/trust#ai-use");

    const realErrors = consoleErrors.filter((e) => !e.includes("Extension context invalidated"));
    expect(realErrors, `console errors on / (${name})`).toEqual([]);
  });

  test(`/trust AI use & disclosure section renders with no console errors — ${name}`, async ({ page }) => {
    await page.setViewportSize(size);

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/trust#ai-use");

    await expect(page.getByRole("heading", { name: "AI use & disclosure" })).toBeVisible();
    await expect(page.getByText("Contact form classifier")).toBeVisible();

    const realErrors = consoleErrors.filter((e) => !e.includes("Extension context invalidated"));
    expect(realErrors, `console errors on /trust (${name})`).toEqual([]);
  });
}
