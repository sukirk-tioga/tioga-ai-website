// Shared contact-form classification schema. Fixed literal sets the model's
// output is validated against — this is what makes the classifier's
// structured fields (service/urgency/complexity/responseTime/fitScore)
// structurally incapable of carrying arbitrary free-form AI-generated text
// back to the caller. A malformed or off-schema model response is rejected
// outright (validateClassification throws) rather than passed through.
export const VALID_SERVICES = [
  "Automate finance and operations",
  "Modernize ERP with an agent layer",
  "Govern enterprise AI",
] as const;
export const VALID_URGENCY = ["low", "medium", "high", "critical"] as const;
export const VALID_COMPLEXITY = ["small", "medium", "large", "enterprise"] as const;
export const VALID_RESPONSE_TIME = [
  "within 4 hours",
  "within 1 business day",
  "within 2 business days",
] as const;

// summary/nextStep remain free text by design (one-sentence descriptions),
// but are length-capped as defense in depth. NOTE: both fields are rendered
// directly to the site visitor in SmartContactForm's success state — flagged
// as a separate, higher-severity finding in this task's report rather than
// "fixed" here (removing/redesigning that display is a product call, not a
// schema-tightening one).
const MAX_FREE_TEXT_LEN = 400;

export interface Classification {
  service: (typeof VALID_SERVICES)[number];
  urgency: (typeof VALID_URGENCY)[number];
  complexity: (typeof VALID_COMPLEXITY)[number];
  summary: string;
  nextStep: string;
  responseTime: (typeof VALID_RESPONSE_TIME)[number];
  fitScore: number;
}

export function validateClassification(raw: unknown): Classification {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Classification response was not an object.");
  }
  const r = raw as Record<string, unknown>;

  if (!VALID_SERVICES.includes(r.service as (typeof VALID_SERVICES)[number])) {
    throw new Error(`Invalid service value: ${String(r.service)}`);
  }
  if (!VALID_URGENCY.includes(r.urgency as (typeof VALID_URGENCY)[number])) {
    throw new Error(`Invalid urgency value: ${String(r.urgency)}`);
  }
  if (!VALID_COMPLEXITY.includes(r.complexity as (typeof VALID_COMPLEXITY)[number])) {
    throw new Error(`Invalid complexity value: ${String(r.complexity)}`);
  }
  if (!VALID_RESPONSE_TIME.includes(r.responseTime as (typeof VALID_RESPONSE_TIME)[number])) {
    throw new Error(`Invalid responseTime value: ${String(r.responseTime)}`);
  }
  if (typeof r.summary !== "string" || r.summary.trim().length === 0) {
    throw new Error("Missing or invalid summary.");
  }
  if (typeof r.nextStep !== "string" || r.nextStep.trim().length === 0) {
    throw new Error("Missing or invalid nextStep.");
  }
  const fitScoreNum = Number(r.fitScore);
  if (!Number.isFinite(fitScoreNum)) {
    throw new Error(`Invalid fitScore value: ${String(r.fitScore)}`);
  }

  return {
    service: r.service as (typeof VALID_SERVICES)[number],
    urgency: r.urgency as (typeof VALID_URGENCY)[number],
    complexity: r.complexity as (typeof VALID_COMPLEXITY)[number],
    summary: r.summary.trim().slice(0, MAX_FREE_TEXT_LEN),
    nextStep: r.nextStep.trim().slice(0, MAX_FREE_TEXT_LEN),
    responseTime: r.responseTime as (typeof VALID_RESPONSE_TIME)[number],
    // Clamp to the documented 1-10 range and drop any fractional part
    // rather than trusting the model's number verbatim.
    fitScore: Math.min(10, Math.max(1, Math.round(fitScoreNum))),
  };
}
