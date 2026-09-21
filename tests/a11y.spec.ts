import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Automated WCAG 2 A/AA regression check (axe-core) on representative pages and
// on states a page-load audit never sees (open tab, opened chat, calculator
// result). No API key or network needed: every state below is client-only.
//
// Scope, stated plainly: axe catches roughly a third of WCAG issues. This does
// NOT replace keyboard/screen-reader testing, and no real screen reader
// (VoiceOver/NVDA) is involved anywhere in this repo's checks.
//
// Determinism: reduced-motion emulation makes CSS transitions/entrance
// animations instant (site-wide rule in globals.css), so axe never samples a
// colour mid-fade. Disabled controls are excluded: WCAG 1.4.3 exempts inactive
// components, and busy-state buttons briefly render at half opacity.

test.use({ reducedMotion: "reduce" });

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function scan(page: Page) {
  // Let entrance animations/transitions land on their end state first, so axe
  // never reads a half-faded colour. (Under reduced motion they are ~instant.)
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
          .map((a) => a.finished.catch(() => undefined))
      ),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ])
  );
  const results = await new AxeBuilder({ page })
    .withTags(TAGS)
    .exclude("button:disabled, input:disabled, select:disabled, textarea:disabled")
    .analyze();
  // Readable failure output: rule id + first target per violation.
  const summary = results.violations.map(
    (v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(" ")} :: ${v.nodes[0]?.failureSummary?.split("\n")[1]?.trim() ?? ""}`
  );
  expect(summary, `axe violations:\n${summary.join("\n")}`).toEqual([]);
}

const PAGES = [
  "/",
  "/services",
  "/about",
  "/contact",
  "/demos",
  "/mcp",
  "/solutions",
  "/articles/mcp-scoped-permissions",
  "/demos/standing-watch",
  "/demos/ap-exception-workflow",
  "/trust/eu-ai-act/calculator",
];

for (const path of PAGES) {
  test(`axe: ${path} initial state has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: "load" });
    await page.locator("main").first().waitFor();
    await scan(page);
  });
}

test("axe: chat widget open", async ({ page }) => {
  await page.goto("/services", { waitUntil: "load" });
  await page.getByRole("button", { name: "Open chat" }).click();
  await expect(page.getByRole("dialog", { name: "Tioga AI Assistant chat" })).toBeVisible();
  await scan(page);
});

test("axe: EU AI Act calculator with a selection and a result", async ({ page }) => {
  await page.goto("/trust/eu-ai-act/calculator", { waitUntil: "load" });
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await page.getByRole("checkbox").first().click();
  await expect(page.getByRole("checkbox").first()).toHaveAttribute("aria-checked", "true");
  await scan(page);
});

test("axe: /mcp with a different code tab selected", async ({ page }) => {
  await page.goto("/mcp", { waitUntil: "load" });
  const tabs = page.locator("button[aria-pressed]");
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-pressed", "true");
  await scan(page);
});

test("axe: ledger demo after proposing a scenario", async ({ page }) => {
  await page.goto("/demos/ap-exception-workflow", { waitUntil: "load" });
  await page.getByRole("button", { name: /^1 — /}).click();
  await expect(page.locator("p[role=status]").filter({ hasText: "Audit ledger now has" })).toContainText("Latest decision");
  await scan(page);
});

test("skip link is the first tab stop and lands on main", async ({ page }) => {
  await page.goto("/services", { waitUntil: "load" });
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toHaveCount(1);
});
