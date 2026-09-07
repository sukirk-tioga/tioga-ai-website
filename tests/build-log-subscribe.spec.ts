import { test, expect } from "@playwright/test";

// Build-log email capture (audit finding G-42: "nothing accumulates: no
// capture, no list, no return path"). Mocks /api/subscribe rather than
// hitting it for real — the real route sends an actual email via Gmail
// SMTP (see lib/email.ts's sendBuildLogSubscribeEmail), which is not
// something a CI run should be triggering. This tests the client-side
// contract (render, submit, success/error states), not the server's email
// delivery, which isn't independently unit-tested elsewhere in this repo
// either (SmartContactForm's real send is untested the same way).

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
  await page.route("**/_vercel/speed-insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
  );
});

test("build-log subscribe form renders on /changelog with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/changelog");
  await expect(page.getByPlaceholder("jane@acme.com")).toBeVisible();
  await expect(page.getByRole("button", { name: "Notify me" })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("submitting a valid email shows the success state", async ({ page }) => {
  await page.route("**/api/subscribe", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
  );

  await page.goto("/changelog");
  await page.getByPlaceholder("jane@acme.com").fill("reader@example.com");
  await page.getByRole("button", { name: "Notify me" }).click();

  await expect(page.getByText("You're in.")).toBeVisible();
});

test("a server-side error surfaces to the user, not a silent failure", async ({ page }) => {
  await page.route("**/api/subscribe", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "Enter a valid email address." }),
    })
  );

  await page.goto("/changelog");
  await page.getByPlaceholder("jane@acme.com").fill("reader@example.com");
  await page.getByRole("button", { name: "Notify me" }).click();

  // Not getByRole("alert") -- Next.js's own route-announcer div also
  // carries role="alert" and makes that locator ambiguous (strict-mode
  // violation, confirmed by running this test before this fix).
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
});
