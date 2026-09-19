import { test, expect } from "@playwright/test";

// Regression guards for the 2026-09-19 comprehensive website review (Codex
// review, triaged by a Fable 5.1 adversarial pass against the live code):
//   F1  seeded/simulated reviewer decisions must not be labeled "actual"
//   F4  headcount demo overflowed the 390px viewport (nowrap MRC badge)
//   F5  Escape must close the mobile menu and return focus to the toggle
//   F6  contact form needs a persistent, associated inline email error

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

const PHONE = { width: 390, height: 844 };

for (const route of [
  "/demos/headcount-forecast-draft-provenance",
  "/demos/timecard-exception-shadow-mode",
]) {
  for (const width of [320, 390, 768]) {
    test(`${route} does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(route);
      const { doc, viewport } = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(doc, `document width at ${width}px viewport`).toBeLessThanOrEqual(viewport);
    });
  }

  test(`${route} labels reviewer decisions as seeded, not actual`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("button", { name: "Reset to seeded reviewer decisions" })).toBeVisible();
    await expect(page.getByText(/actual review outcomes|actual, logged/i)).toHaveCount(0);
  });
}

test("Escape closes the open mobile menu and returns focus to the toggle", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle menu" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("contact form shows an inline, associated error for an invalid email", async ({ page }) => {
  await page.goto("/contact");
  const email = page.locator("#contact-email");
  await email.fill("not-an-email");
  await email.blur();
  const error = page.locator("#contact-email-error");
  await expect(error).toBeVisible();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAttribute("aria-describedby", "contact-email-error");
  await email.fill("jane@acme.com");
  await expect(error).toHaveCount(0);
  await expect(email).not.toHaveAttribute("aria-invalid", "true");
});

test("sitemap omits the noindex standing-watch landing page", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  expect(await res.text()).not.toContain("/lp/standing-watch");
});
