// Cross-vendor evidence-composition demo. A genuinely different shape from
// the other two governed write-path demos: this one isn't about a policy
// deciding auto/escalate/block on a single write path. It's about what
// happens *after* a write path already executed cleanly — because it spans
// TWO systems that each only log their own half of the story, an
// after-the-fact audit question ("who authorized this, and does the record
// prove it matches what actually happened?") is unanswerable from either
// system alone.
//
// Grounded in Tioga's most-corroborated competitive finding: a universal AI
// assistant (Claude/ChatGPT-class, the conversational/orchestration layer)
// logs the conversation and intent; an ERP vendor's own execution agent (an
// SAP-Joule-style layer) logs the transaction. Neither composes the two into
// one attributable record — see
// ~/SecondBrain/TiogaAI/competitive/erp-vendor-agent-layers.md ("What
// neither vendor is building") and
// ~/SecondBrain/TiogaAI/sales/proposals/11-agent-ready-erp-diagnostic.md's
// "evidence composition" axis. SAP's own June 2026 reference architecture
// for third-party MCP access states the enterprise identity/audit
// requirements are "not yet fully addressed" — a vendor-authored admission
// of exactly this gap, not a claim Tioga is inventing.
//
// Same order (SO-4471) and semiconductor capital-equipment framing as the
// other demos and
// ~/SecondBrain/TiogaAI/sales/case-study-semiconductor-capital-equipment-sap-oracle-governance.md
// — illustrative composite scenario, not a real client engagement, matching
// the same honesty rule those demos already carry.
//
// No real vendor names are used in a way that implies partnership or
// endorsement — "a universal AI assistant" and "an ERP vendor's own
// execution agent" are generic throughout, matching the rest of this site's
// existing convention (grep confirms no other page/demo names "Joule" or a
// specific ERP-vendor agent product).

export const CONTROL_TAGS = {
  humanAttribution: "NIST AI RMF GOVERN-1.2 — accountability & assigned authorities for AI-enabled actions",
  policyTrace: "NIST AI RMF GOVERN-1.5 — documented authorities & scope",
  erpValidation: "NIST AI RMF MEASURE-2.7 — system behavior monitored against expectations",
  composedRecord: "NIST AI RMF MANAGE-4.1 — post-deployment monitoring & incident response",
} as const;

export interface AssistantLogEntry {
  sessionId: string;
  timestamp: string;
  userDisplayName: string;
  userMessage: string;
  assistantSummary: string;
}

export interface ErpLogEntry {
  transactionId: string;
  timestamp: string;
  executedBy: string; // a shared integration/service account, never a human
  documentType: string;
  orderId: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface PolicyTierResult {
  tier: string;
  detail: string;
}

export interface ComposedRecord {
  actionId: string;
  humanIdentity: { name: string; email: string; role: string };
  requestText: string;
  requestTimestamp: string;
  policy: PolicyTierResult;
  erp: ErpLogEntry;
  linkedAssistantSessionId: string;
  composedTimestamp: string;
}

export interface AuditCheckItem {
  question: string;
  answerable: boolean;
  detail: string;
}

export const AUDIT_QUESTION =
  "Who authorized this, and does the system record prove it matches what SAP actually executed?";

export const SCENARIO = {
  orderId: "SO-4471",
  requestText: "Finalize the material configuration on order SO-4471 now that engineering signed off.",
  humanIdentity: { name: "Priya Raman", email: "priya.raman@[company].com", role: "Sales Operations Analyst" },
};

// ── Building each half separately, exactly as it would happen in the real
// federated setup — the assistant vendor's log and the ERP's log are built
// from disjoint information, neither one aware the other exists. Only
// buildComposedRecord below reaches into both.

export function buildAssistantLog(): AssistantLogEntry {
  return {
    sessionId: "chat-88231",
    timestamp: new Date().toISOString(),
    userDisplayName: "Priya R.", // a chat display name — not a verified identity binding
    userMessage: SCENARIO.requestText,
    assistantSummary: "Sure — I've asked SAP to finalize SO-4471's material configuration. Let me know if anything else comes up.",
  };
}

export function buildErpLog(): ErpLogEntry {
  return {
    transactionId: "SAP-CDHDR-0092281",
    timestamp: new Date().toISOString(),
    executedBy: "SVC_INTEGRATION_07", // one shared integration account for every agent-initiated write
    documentType: "Sales order change document (VA02)",
    orderId: SCENARIO.orderId,
    field: "Material / net price",
    oldValue: "TBD-ETCH-4471 · $2,400,000 (placeholder)",
    newValue: "CFG-ETCH-4471-5CHAMBER · $2,450,000",
  };
}

// Only Tioga's governance layer sits in the position to build this — it's
// the one component in the flow that both the conversational turn and the
// ERP write pass through.
export function buildComposedRecord(assistant: AssistantLogEntry, erp: ErpLogEntry): ComposedRecord {
  return {
    actionId: "tioga-evd-4471-01",
    humanIdentity: SCENARIO.humanIdentity,
    requestText: assistant.userMessage,
    requestTimestamp: assistant.timestamp,
    policy: {
      tier: "auto-execute — material delta 2.1%, within 8% tolerance",
      detail: "Evaluated against the same material-delta policy as the capital-equipment order-booking write path — within tolerance, no human escalation required.",
    },
    erp,
    linkedAssistantSessionId: assistant.sessionId,
    composedTimestamp: new Date().toISOString(),
  };
}

// ── Audit checklists — what the same real audit question can and can't
// answer from each panel alone. Deliberately built from only the fields
// that panel actually carries, so the "unanswerable" verdicts below are a
// direct consequence of the data shape above, not a scripted conclusion.

export function auditFromAssistantLog(a: AssistantLogEntry): AuditCheckItem[] {
  return [
    {
      question: "Who asked for this?",
      answerable: false,
      detail: `Only a chat display name ("${a.userDisplayName}") from the session — no verified employee identity, no role, nothing that would hold up as the authorization record for a $2.45M order change.`,
    },
    {
      question: "What exactly was requested?",
      answerable: true,
      detail: `The message is right here: "${a.userMessage}"`,
    },
    {
      question: "What policy tier was this evaluated under?",
      answerable: false,
      detail: "A conversation transcript has no concept of a policy tier — that's a governance-layer idea this log was never built to carry.",
    },
    {
      question: "What did the ERP actually execute?",
      answerable: false,
      detail: `The assistant's own summary ("${a.assistantSummary}") is a self-report, not a transaction record — no SAP document number, no before/after values, no independent proof it happened at all.`,
    },
    {
      question: "Does the request match what executed?",
      answerable: false,
      detail: "With no transaction record to compare against, this can't be answered from this panel alone.",
    },
  ];
}

export function auditFromErpLog(e: ErpLogEntry): AuditCheckItem[] {
  return [
    {
      question: "Who asked for this?",
      answerable: false,
      detail: `executedBy is a shared integration account ("${e.executedBy}") — the same credential fires for every agent-initiated write. It doesn't say Priya Raman, or any human at all.`,
    },
    {
      question: "What exactly was requested?",
      answerable: false,
      detail: `SAP's change document records a field-level diff (${e.field}: ${e.oldValue} → ${e.newValue}) — no natural-language context on why, or what was actually asked for.`,
    },
    {
      question: "What policy tier was this evaluated under?",
      answerable: false,
      detail: "The ERP's change document has no field for a policy-evaluation tier — that's not something the ERP itself tracks.",
    },
    {
      question: "What did the ERP actually execute?",
      answerable: true,
      detail: `Right here: ${e.documentType}, ${e.transactionId} — ${e.field} changed from ${e.oldValue} to ${e.newValue}.`,
    },
    {
      question: "Does the request match what executed?",
      answerable: false,
      detail: "There's no request on record to compare this transaction against — only the transaction itself.",
    },
  ];
}

export function auditFromComposedRecord(c: ComposedRecord): AuditCheckItem[] {
  return [
    {
      question: "Who asked for this?",
      answerable: true,
      detail: `${c.humanIdentity.name}, ${c.humanIdentity.role} (${c.humanIdentity.email}) — a real, verified identity, not a display name or a shared integration account.`,
    },
    {
      question: "What exactly was requested?",
      answerable: true,
      detail: `"${c.requestText}" — timestamped ${new Date(c.requestTimestamp).toLocaleTimeString()}, linked to assistant session ${c.linkedAssistantSessionId}.`,
    },
    {
      question: "What policy tier was this evaluated under?",
      answerable: true,
      detail: `${c.policy.tier} — ${c.policy.detail}`,
    },
    {
      question: "What did the ERP actually execute?",
      answerable: true,
      detail: `${c.erp.documentType}, ${c.erp.transactionId} — ${c.erp.field} changed from ${c.erp.oldValue} to ${c.erp.newValue}, executed under ${c.erp.executedBy} but attributed here to the human who requested it.`,
    },
    {
      question: "Does the request match what executed?",
      answerable: true,
      detail: "Yes — the composed record links the request, the policy evaluation, and the ERP transaction into one queryable action ID, so this is checked, not assumed.",
    },
  ];
}
