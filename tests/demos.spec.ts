import { test, expect } from "@playwright/test";

// Functional tests — these actually invoke Claude and cost real (small)
// money. Run on a schedule against production, not on every push. This
// suite exists because of two real bugs found in production on 2026-07-27:
//   1. migration-assessment called a retired model ID and 502'd on every
//      submission, with the UI silently reverting with no visible error.
//   2. The chat widget rendered raw "**markdown**" syntax instead of
//      formatting it, because it had no markdown renderer.
// Both would have been caught immediately by the tests below.

test("migration assessment demo returns a real assessment", async ({ page }) => {
  // The demo's own copy tells users to expect "about 60 seconds" — the
  // previous 30s assertion timeout (and Playwright's 30s default overall
  // test timeout) was tighter than that from the day this test was
  // written, so any run where the live model genuinely took 30-60s (normal,
  // expected latency, not a bug) failed here. Confirmed live 2026-08-09:
  // manually exercised the demo, got a real result in ~20-25s, then this
  // exact test failed once and passed once on immediate re-runs with zero
  // code changes -- a timing flake, not a regression. Give both the overall
  // test and the assertion real headroom above the documented 60s.
  test.setTimeout(90_000);

  await page.goto("/demos/migration-assessment");
  await page.getByRole("button", { name: /generate readiness assessment/i }).click();

  // Give the model time to respond — this is a live API call, not a mock.
  const complexityHeading = page.getByText("Migration Complexity");
  await expect(complexityHeading).toBeVisible({ timeout: 75_000 });

  // The score circle, risks, and next steps should all render — if the
  // API call fails, the button just reverts with no result section at all.
  await expect(page.getByText("TOP RISKS")).toBeVisible();
  await expect(page.getByText("RECOMMENDED APPROACH")).toBeVisible();
  await expect(page.getByText("NEXT STEPS")).toBeVisible();
});

test("chat widget renders markdown, not raw asterisks", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /open chat/i }).click();
  await expect(page.getByText("Tioga AI Assistant")).toBeVisible();

  const input = page.getByPlaceholder("Ask about our services...");
  await input.fill("What's your typical project timeline and pricing structure?");
  await input.press("Enter");

  // Assistant rows carry justify-start, user rows justify-end (see
  // ChatWidget.tsx) — the last assistant row is our new reply, not the
  // welcome message or the just-sent user question.
  const lastAssistantReply = page.locator(".chat-scroll > div.justify-start").last();

  // Wait for real streamed content (not just the empty bubble + bouncing
  // typing-indicator dots).
  await expect(async () => {
    const text = await lastAssistantReply.innerText();
    expect(text.length).toBeGreaterThan(60);
  }).toPass({ timeout: 20_000 });

  // The regression this guards against: literal "**" characters leaking
  // into the rendered chat bubble because markdown wasn't being parsed.
  const replyText = await lastAssistantReply.innerText();
  expect(replyText, "raw markdown syntax should not appear in chat output").not.toMatch(/\*\*\S/);
});

test("invoice processing demo returns structured data", async ({ request }) => {
  const res = await request.post("/api/invoice-parse", {
    data: {
      text: "INVOICE #4521\nVendor: Acme Supplies Inc.\nTotal: $5,616\nDue: 2026-02-15",
    },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.result?.vendor).toBeTruthy();
  expect(body.result?.total).toBeTruthy();
});

test("email triage demo classifies correctly", async ({ request }) => {
  const res = await request.post("/api/demo-email", {
    data: {
      email:
        "Subject: Urgent - system down\n\nOur production ERP has been down for 2 hours. Please call ASAP.",
    },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.result?.category).toBeTruthy();
  expect(body.result?.urgency).toBeTruthy();
});

test("MCP demo answers from mock enterprise data", async ({ request }) => {
  const res = await request.post("/api/mcp-demo", {
    data: { query: "What is the total sales pipeline value?" },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.answer).toBeTruthy();
  expect(body.mcpCalls?.tools?.length).toBeGreaterThan(0);
});
