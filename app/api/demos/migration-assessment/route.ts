import { callClaudeStructured } from "@/app/demos/_lib/anthropic";
import { sendMigrationAssessmentCopy } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// ── Allowed values — nothing outside these enums ever reaches the prompt ─────
const VERSIONS = ["R12.1", "R12.2"] as const;
const MODULES = ["FI", "AP", "AR", "GL", "FA", "INV", "PO"] as const;
const VOLUMES = ["1-10GB", "10-100GB", "100GB-1TB", "1TB+"] as const;
const TARGETS = ["S/4HANA Cloud", "S/4HANA Private Cloud", "S/4HANA On-Premise"] as const;

const MODULE_NAMES: Record<string, string> = {
  FI: "Financials (FI)",
  AP: "Accounts Payable (AP)",
  AR: "Accounts Receivable (AR)",
  GL: "General Ledger (GL)",
  FA: "Fixed Assets (FA)",
  INV: "Inventory (INV)",
  PO: "Purchasing (PO)",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const { allowed } = rateLimit(`migration:${ip}`, 5, 10 * 60 * 1000); // 5 requests / 10 min
  if (!allowed) {
    return bad("You've reached the demo limit. Try again in a few minutes — or book a call for the real thing.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request body.");
  }
  const { version, modules, dataVolume, target, email } = (body ?? {}) as Record<string, unknown>;

  // Strict enum validation — no free text reaches the prompt
  if (typeof version !== "string" || !(VERSIONS as readonly string[]).includes(version)) {
    return bad("Invalid Oracle EBS version.");
  }
  if (
    !Array.isArray(modules) ||
    modules.length === 0 ||
    modules.length > MODULES.length ||
    !modules.every((m) => typeof m === "string" && (MODULES as readonly string[]).includes(m))
  ) {
    return bad("Select at least one valid module.");
  }
  const selectedModules = Array.from(new Set(modules as string[]));
  if (typeof dataVolume !== "string" || !(VOLUMES as readonly string[]).includes(dataVolume)) {
    return bad("Invalid data volume.");
  }
  if (typeof target !== "string" || !(TARGETS as readonly string[]).includes(target)) {
    return bad("Invalid target SAP edition.");
  }
  if (email !== undefined && email !== "" && (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email))) {
    return bad("Invalid email address.");
  }

  const hasFinancials = selectedModules.some((m) => ["FI", "GL", "AP"].includes(m));

  const system = `You are a senior migration architect at Tioga AI with 15+ years leading Oracle E-Business Suite to SAP S/4HANA programs for enterprises. You produce honest, conservative readiness assessments.

Rules:
- Be SPECIFIC to the modules selected — name module-level concerns (e.g., open AP/AR item reconciliation, FA depreciation history conversion, GL chart-of-accounts redesign, INV valuation method changes, open PO commitments), not generic migration advice.
- Be conservative on timelines. Enterprises consistently underestimate data migration and parallel-run phases.
- ${hasFinancials ? "FI/GL/AP modules are in scope: you MUST explicitly address SOX compliance and audit-trail preservation in the risks or reasoning." : "Note compliance considerations where relevant."}`;

  const prompt = `Assess this Oracle EBS to SAP S/4HANA migration:

- Oracle EBS version: ${version}
- Modules in use: ${selectedModules.map((m) => MODULE_NAMES[m]).join(", ")}
- Approximate data volume: ${dataVolume}
- Target SAP edition: ${target}

Call the submit_assessment tool with your assessment.`;

  // Structured output via tool-use: the API enforces this schema at the
  // model layer, so the result is guaranteed-valid JSON — no free-text
  // JSON.parse() on the model's raw output, which is what previously
  // failed intermittently in production (2026-08-06) whenever a risk
  // detail happened to contain a character that broke naive JSON parsing.
  const ASSESSMENT_SCHEMA = {
    properties: {
      complexityScore: { type: "integer", minimum: 1, maximum: 10, description: "10 is most complex" },
      scoreReasoning: { type: "string", description: "2-3 sentences, referencing the specific modules and data volume" },
      timelineRange: { type: "string", description: "conservative range, e.g. '10-16 months'" },
      topRisks: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            detail: { type: "string", description: "exactly 2 sentences of specific detail" },
          },
          required: ["title", "detail"],
        },
      },
      recommendedApproach: {
        type: "object",
        properties: {
          approach: { type: "string", enum: ["greenfield", "brownfield", "selective"] },
          reasoning: { type: "string", description: "2-3 sentences on why, given this module mix and target edition" },
        },
        required: ["approach", "reasoning"],
      },
      nextSteps: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        items: { type: "string" },
      },
    },
    required: ["complexityScore", "scoreReasoning", "timelineRange", "topRisks", "recommendedApproach", "nextSteps"],
  };

  try {
    const result = await callClaudeStructured<{
      complexityScore: unknown;
      scoreReasoning: unknown;
      timelineRange: unknown;
      topRisks: unknown;
      recommendedApproach?: { approach?: unknown; reasoning?: unknown };
      nextSteps: unknown;
    }>({
      system,
      prompt,
      toolName: "submit_assessment",
      toolDescription: "Submit the Oracle EBS to SAP S/4HANA migration readiness assessment.",
      schema: ASSESSMENT_SCHEMA,
    });

    console.error("[migration-assessment] DEBUG raw tool input:", JSON.stringify(result));

    const score = Math.min(10, Math.max(1, Math.round(Number(result.complexityScore))));
    if (!Number.isFinite(score)) throw new Error("bad complexityScore");
    if (!Array.isArray(result.topRisks) || result.topRisks.length === 0) throw new Error("bad topRisks");
    const approach = String(result.recommendedApproach?.approach ?? "").toLowerCase();
    if (!["greenfield", "brownfield", "selective"].includes(approach)) throw new Error("bad approach");

    const assessment = {
      complexityScore: score,
      scoreReasoning: String(result.scoreReasoning ?? ""),
      timelineRange: String(result.timelineRange ?? ""),
      topRisks: result.topRisks.slice(0, 3).map((r: { title?: unknown; detail?: unknown }) => ({
        title: String(r.title ?? ""),
        detail: String(r.detail ?? ""),
      })),
      recommendedApproach: {
        approach,
        reasoning: String(result.recommendedApproach?.reasoning ?? ""),
      },
      nextSteps: Array.isArray(result.nextSteps) ? result.nextSteps.slice(0, 3).map(String) : [],
    };

    let emailed = false;
    if (typeof email === "string" && email) {
      try {
        await sendMigrationAssessmentCopy({
          to: email,
          version,
          modules: selectedModules.map((m) => MODULE_NAMES[m]).join(", "),
          dataVolume,
          target,
          assessment,
        });
        emailed = true;
      } catch (err) {
        console.error("[migration-assessment] email delivery failed:", err);
      }
    }

    return new Response(
      JSON.stringify({ assessment, emailed }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[migration-assessment] generation failed:", err);
    return bad(
      "We couldn't generate the assessment just now — please try again in a moment.",
      502
    );
  }
}
