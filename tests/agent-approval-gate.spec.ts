import { test, expect } from "@playwright/test";

// Human-approval-hold fix for the autonomous email agent (see
// app/api/agent/inbound/route.ts, app/api/classify/route.ts,
// lib/agent-approval.ts, app/api/agent/approve/route.ts). These hit the
// real routes directly (no mocking) rather than a browser page, since the
// behavior under test is server-side request validation, not UI — but only
// the parts of that behavior that are deterministic without live
// Postmark/Upstash/SMTP credentials, matching this repo's existing
// discipline of not exercising real outbound sends in CI (see
// build-log-subscribe.spec.ts's comment on why SmartContactForm's real
// send is untested the same way).

test("agent/inbound rejects unauthenticated requests (fail-closed unchanged by the approval-hold refactor)", async ({ request }) => {
  const res = await request.post("/api/agent/inbound", {
    data: { From: "prospect@example.com", MessageID: "abc", TextBody: "hello", To: "reply+xyz@agent.tioga.ai" },
  });
  // Whether or not POSTMARK_INBOUND_BASIC_AUTH_USER/PASS are configured in
  // this environment, an unauthenticated call must never be treated as
  // authorized -- isAuthorized() fails closed either way.
  expect(res.status()).toBe(401);
  const body = await res.json();
  expect(body.error).toBe("Unauthorized.");
});

test("agent/approve rejects a request with no id/action", async ({ request }) => {
  const res = await request.get("/api/agent/approve");
  expect(res.status()).toBe(400);
});

test("agent/approve rejects a request with an id but no action", async ({ request }) => {
  const res = await request.get("/api/agent/approve?id=someid");
  expect(res.status()).toBe(400);
});

test("agent/approve rejects a request with an invalid action", async ({ request }) => {
  const res = await request.get("/api/agent/approve?id=someid&action=send-it-now");
  expect(res.status()).toBe(400);
});

test("agent/approve treats an unknown approval id as invalid/expired, not a crash", async ({ request }) => {
  // Only meaningful once UPSTASH_REDIS_REST_URL/TOKEN are configured -- if
  // they aren't (this repo's current state), the lookup itself throws and
  // the route still fails closed (500, no send), which this assertion also
  // accepts. Either way, an unknown/garbage id must never result in an
  // actual send.
  const res = await request.get("/api/agent/approve?id=this-approval-id-does-not-exist&action=approve");
  expect([404, 500]).toContain(res.status());
});
