// Marble (World Labs) World-Generation Audit — grounded in a REAL trial run,
// not a simulated/composite scenario like the other demos in this folder.
// Full methodology + raw outputs: ~/MarbleTrial/ (marble_trial.py, measure.html,
// runs/20260821T222610Z/). See ~/.claude/projects/-Users-sukirk/memory/
// marble-trial-completed-2026-08-21.md for the source record.

export type AuditCheckItem = {
  claim: string;
  verified: boolean;
  detail: string;
};

export const TRIAL_META = {
  runId: "20260821T222610Z",
  date: "2026-08-21",
  inputType: "Single photo (image-to-world)",
  model: "marble-1.1",
  cost: "$1.20 per generation",
};

export const TOS_CHECKLIST: AuditCheckItem[] = [
  {
    claim: "Free tier: you own the generated output",
    verified: false,
    detail: "World Labs retains ownership of free-tier output, and free-tier input carries an irrevocable training license.",
  },
  {
    claim: "Free tier: your input photo isn't used for training beyond this generation",
    verified: false,
    detail: "Free-tier terms grant an irrevocable right to train on submitted input — it doesn't expire when you delete the world.",
  },
  {
    claim: "Paid API: you get commercial rights to generated output",
    verified: true,
    detail: "Confirmed — paid API access grants commercial rights, with limits on sublicensing, attribution, and usage volume.",
  },
  {
    claim: "Exported files carry provenance/training metadata (C2PA, XMP, EXIF)",
    verified: false,
    detail: "Scanned 14 exported files (2 real generations) byte-for-byte. Zero real provenance markers found. See the provenance panel below.",
  },
];

export const PROVENANCE_RESULT = {
  filesScanned: 14,
  runsScanned: 2,
  realMarkersFound: 0,
  falsePositiveCaught: {
    file: "mesh_collider.glb",
    matched: '"extras"',
    resolution: 'Opened the glTF JSON chunk directly — the only extras field present is meshes[0].extras = {"processed": true}, an internal pipeline flag, not identity or training-provenance data.',
  },
};

export const METRIC_SCALE_RESULT = {
  referenceLabel: "Total visible wall width in the source photo (left window's outer edge to right window's outer edge)",
  referenceValueFt: 12,
  referenceMethod: "Measured by eye, not a tape measure — a soft baseline, not a precision reference.",
  reconstructedValueFt: 14.29,
  reconstructedMethod: "Two-point click distance in the exported collider mesh, scaled by the API's own metric_scale_factor (0.9789486), measured with a purpose-built local click-to-measure tool (three.js).",
  errorPct: 19.1,
  errorDirection: "overshoot",
  caveat: "Single-image generation with the camera at an angle to the wall — some scale error is expected. 19% is large enough to matter for any dimensional-accuracy claim and should be caveated, or re-tested with a precise reference and/or multi-image input, before being cited in client-facing material.",
};

export const AUDIT_QUESTION =
  "If a vendor tells you their AI-generated 3D reconstruction is commercially usable and dimensionally accurate, do you take that on faith — or do you check?";

export const METHODOLOGY_NOTE =
  "Every number on this page came from an actual run against World Labs' World API, not a mocked or illustrative scenario — 2 real generations (~$2.40), a byte-level provenance scan of every exported file, and a real two-point measurement against a physical reference. The test harness itself had 3 real integration bugs along the way (API response fields didn't match assumed names) — all caught and fixed by running it, not by reading documentation alone.";
