import { callClaude } from "@/app/demos/_lib/anthropic";
import { sendFusionReadinessCopy } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Replaces app/api/demos/migration-assessment/route.ts (retired 2026-09-10
// with the EBS→S/4HANA migration-assessment demo). Same
// enum-only-input/real-Claude-call/validated-output scaffolding; new domain:
// how ready is a given Oracle Fusion Cloud ERP environment to safely run
// governed AI agents against it, not "should you migrate off it."

// ── Allowed values — nothing outside these enums ever reaches the prompt ─────
const USE_CASES = [
  "AP invoice exceptions (Fusion Payables)",
  "Procurement requisition triage (Fusion Procurement)",
  "GL journal review & anomaly detection (Fusion General Ledger)",
  "Expense report auditing (Fusion Expenses)",
] as const;

const VOLUMES = ["<1,000/month", "1,000–10,000/month", "10,000–100,000/month", "100,000+/month"] as const;

const INTEGRATION_METHODS = [
  "No integration yet — planning phase",
  "Calling Fusion REST APIs directly",
  "Oracle Integration Cloud (OIC) as middleware",
  "Oracle AI Agent Studio (business-object + deep-link tools)",
] as const;

const GOVERNANCE_CONTROLS = [
  "Agent-scoped security roles (not just seeded Fusion roles)",
  "REST API access scoped to specific endpoints, not broad admin access",
  "Structured audit trail exported to a governance/audit system",
  "Human-approval rules extended to agent-initiated actions, not just human-initiated ones",
  "Named incident-response owner for agent actions",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`fusion-ai-readiness:${ip}`, 5, 10 * 60 * 1000); // 5 requests / 10 min
  if (!allowed) {
    return bad("You've reached the demo limit. Try again in a few minutes — or book a call for the real thing.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request body.");
  }
  const { useCase, transactionVolume, integrationMethod, governanceControls, email } = (body ?? {}) as Record<string, unknown>;

  // Strict enum validation — no free text reaches the prompt
  if (typeof useCase !== "string" || !(USE_CASES as readonly string[]).includes(useCase)) {
    return bad("Invalid agent use case.");
  }
  if (typeof transactionVolume !== "string" || !(VOLUMES as readonly string[]).includes(transactionVolume)) {
    return bad("Invalid transaction volume.");
  }
  if (typeof integrationMethod !== "string" || !(INTEGRATION_METHODS as readonly string[]).includes(integrationMethod)) {
    return bad("Invalid integration method.");
  }
  if (
    !Array.isArray(governanceControls) ||
    governanceControls.length > GOVERNANCE_CONTROLS.length ||
    !governanceControls.every((c) => typeof c === "string" && (GOVERNANCE_CONTROLS as readonly string[]).includes(c))
  ) {
    return bad("Invalid governance controls selection.");
  }
  const selectedControls = Array.from(new Set(governanceControls as string[]));
  if (email !== undefined && email !== "" && (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email))) {
    return bad("Invalid email address.");
  }

  // A conditional rule mirroring the retired migration-assessment demo's
  // SOX-disclosure rule: fewer than two governance controls already in
  // place is a real, structural blocker for agent-initiated writes, not a
  // stylistic nitpick — the prompt below must say so explicitly rather than
  // softening it into generic advice.
  const controlsAreThin = selectedControls.length < 2;

  const system = `You are a senior AI-governance architect at Tioga AI with deep experience deploying governed AI agents against Oracle Fusion Cloud ERP environments via Fusion's REST APIs and Oracle's AI Agent Studio. You produce honest, conservative AI-agent-readiness assessments — you are assessing whether it is safe to deploy AI agents against an existing Fusion Cloud ERP environment, not whether the organization should adopt or migrate to Fusion itself.

Rules:
- Be SPECIFIC to the use case selected — reference real Fusion Cloud ERP concepts for that use case (e.g. Payables invoice holds and matching for AP exceptions, supplier and purchase-order approval for procurement triage, chart-of-accounts and period-close controls for GL review, expense policy violations for expense auditing), not generic AI-governance advice.
- Be conservative on readiness. Err toward flagging real gaps rather than declaring an environment "ready" on the strength of good intentions.
- ${controlsAreThin ? "Fewer than two governance controls are already in place: you MUST explicitly call this a structural blocker to any autonomous (non-human-gated) agent action in the risks or reasoning, not a minor gap." : "Note any remaining governance gap even where several controls are already in place — no environment should be scored a 10 on selected controls alone."}
- Respond with VALID JSON ONLY. No markdown, no code fences, no commentary outside the JSON object. Every string value must be valid JSON: escape internal double quotes as \\", escape newlines as \\n, and never break out of a string value to use another format (e.g. XML tags) inside it.`;

  const prompt = `Assess this Oracle Fusion Cloud ERP AI-agent-readiness scenario:

- Target agent use case: ${useCase}
- Approximate transaction volume: ${transactionVolume}
- Current integration method: ${integrationMethod}
- Governance controls already in place: ${selectedControls.length > 0 ? selectedControls.join("; ") : "none selected"}

Return exactly this JSON structure:
{
  "readinessScore": <integer 1-10, where 10 is most ready to safely deploy governed AI agents>,
  "scoreReasoning": "<2-3 sentences explaining the score, referencing the specific use case and controls selected>",
  "keyGaps": [
    { "title": "<short gap title>", "detail": "<exactly 2 sentences of specific detail>" },
    { "title": "...", "detail": "..." },
    { "title": "...", "detail": "..." }
  ],
  "recommendedApproach": {
    "approach": "<one of: pilot-ready | needs-guardrails | not-ready>",
    "reasoning": "<2-3 sentences on why, given this use case, volume, and control set>"
  },
  "nextSteps": ["<concrete step>", "<concrete step>", "<optional third step>"]
}`;

  // Free-text JSON, not tool-use — see the retired migration-assessment
  // route's comment (git history) for why: Anthropic tool-use proved
  // schema-guided, not schema-enforced, on this exact response shape.
  function extractJson(raw: string): unknown {
    const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no JSON object in model output");
    try {
      return JSON.parse(match[0]);
    } catch {
      // Common, mechanically-fixable issues: trailing commas before a
      // closing bracket, and raw control characters inside string values.
      const repaired = match[0]
        .replace(/,(\s*[\]}])/g, "$1")
        .replace(/[\u0000-\u001F]/g, " ");
      return JSON.parse(repaired);
    }
  }

  type RawAssessment = {
    readinessScore: unknown;
    scoreReasoning: unknown;
    keyGaps: unknown;
    recommendedApproach?: { approach?: unknown; reasoning?: unknown };
    nextSteps: unknown;
  };

  function shapeAssessment(result: RawAssessment) {
    const score = Math.min(10, Math.max(1, Math.round(Number(result.readinessScore))));
    if (!Number.isFinite(score)) throw new Error("bad readinessScore");
    if (
      !Array.isArray(result.keyGaps) ||
      result.keyGaps.length === 0 ||
      !result.keyGaps.every((r) => r && typeof r === "object" && "title" in r && "detail" in r)
    ) {
      throw new Error("bad keyGaps");
    }
    const approach = String(result.recommendedApproach?.approach ?? "").toLowerCase();
    if (!["pilot-ready", "needs-guardrails", "not-ready"].includes(approach)) throw new Error("bad approach");

    return {
      readinessScore: score,
      scoreReasoning: String(result.scoreReasoning ?? ""),
      keyGaps: (result.keyGaps as { title?: unknown; detail?: unknown }[]).slice(0, 3).map((r) => ({
        title: String(r.title ?? ""),
        detail: String(r.detail ?? ""),
      })),
      recommendedApproach: {
        approach,
        reasoning: String(result.recommendedApproach?.reasoning ?? ""),
      },
      nextSteps: Array.isArray(result.nextSteps) ? result.nextSteps.slice(0, 3).map(String) : [],
    };
  }

  try {
    // One retry: a malformed generation is rare but not impossible, so a
    // second attempt is worth it before failing the request outright.
    let assessment: ReturnType<typeof shapeAssessment> | undefined;
    let lastErr: unknown;
    for (let attempt = 0; attempt < 2 && !assessment; attempt++) {
      try {
        const raw = await callClaude({ system, prompt });
        const result = extractJson(raw) as RawAssessment;
        assessment = shapeAssessment(result);
      } catch (err) {
        lastErr = err;
        console.error(`[fusion-ai-readiness-assessment] attempt ${attempt + 1} failed:`, err);
      }
    }
    if (!assessment) throw lastErr ?? new Error("assessment generation failed");

    let emailed = false;
    if (typeof email === "string" && email) {
      try {
        await sendFusionReadinessCopy({
          to: email,
          useCase,
          transactionVolume,
          integrationMethod,
          assessment,
        });
        emailed = true;
      } catch (err) {
        console.error("[fusion-ai-readiness-assessment] email delivery failed:", err);
      }
    }

    return new Response(
      JSON.stringify({ assessment, emailed }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[fusion-ai-readiness-assessment] generation failed:", err);
    return bad(
      "I couldn't generate the assessment just now — please try again in a moment.",
      502
    );
  }
}
