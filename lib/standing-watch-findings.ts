// Single source of truth for Standing Watch's real 9-row findings set —
// extracted 2026-09-14 from app/demos/standing-watch/page.tsx so the HTML
// table, the no-WebGL fallback, and "The Boundary" 3D scene all import the
// same data instead of drifting copies (docs/design/3d-design-standard.md
// §6.4: "data has exactly one source of truth"). Values are unchanged from
// the original inline array — see page.tsx's own header comment for the
// redaction/provenance note (captured 2026-08-10, network-identifying
// details redacted, dates/severities/CVE IDs/narrative arc real and
// unedited).

export interface FindingRow {
  severity: "CRITICAL" | "HIGH" | "LOW";
  host: string;
  finding: string;
  status: "fixed" | "human";
  note: string;
}

export const FLAGGED: FindingRow[] = [
  {
    severity: "CRITICAL",
    host: "[internal-host-1]",
    finding: "JARVIS AI gateway had no authentication — unauthenticated /v1/models returned 200",
    status: "fixed",
    note: "Auth token added; re-checked live — unauthenticated request now returns 401",
  },
  {
    severity: "HIGH",
    host: "[internal-host-1]",
    finding: "Remote Management (ARD) listener open, allowInsecureDH=1",
    status: "fixed",
    note: "Disabled; verified closed via port check",
  },
  {
    severity: "HIGH",
    host: "[internal-host-1]",
    finding: "Kerberos KDC listener open (pulled up by Remote Management)",
    status: "fixed",
    note: "Closed as a side effect of disabling Remote Management; verified via port check",
  },
  {
    severity: "HIGH",
    host: "[internal-host-1]",
    finding: "Screen Sharing / VNC listener open on all interfaces",
    status: "fixed",
    note: "Disabled; verified closed via port check",
  },
  {
    severity: "HIGH",
    host: "[internal-host-1]",
    finding: "SSH listening with PasswordAuthentication not explicitly disabled (macOS default: yes)",
    status: "fixed",
    note: "Set to key-only; verified key-based access still worked before closing the session",
  },
  {
    severity: "HIGH",
    host: "both machines",
    finding: "Syncthing admin API has no username/password — any local process can reconfigure sync",
    status: "fixed",
    note: "GUI auth added on both machines; API keys rotated",
  },
  {
    severity: "HIGH",
    host: "both machines",
    finding: "Security-relevant Homebrew packages outdated (gh, node, openssl@3, syncthing, and related CVEs)",
    status: "fixed",
    note: "Upgraded on both machines, including a GitHub CLI update that resolved 4 tracked gh CVEs",
  },
  {
    severity: "LOW",
    host: "both machines",
    finding: "Docker Desktop outdated",
    status: "fixed",
    note: "Upgraded on both machines",
  },
  {
    severity: "HIGH",
    host: "[internal-host-1]",
    finding: "FileVault is OFF",
    status: "human",
    note: "Needs Recovery Mode / physical console access — the automation has no path to enable this itself",
  },
];

export const severityStyle: Record<FindingRow["severity"], { background: string; border: string; color: string }> = {
  CRITICAL: { background: "#EF444420", border: "1px solid var(--error)", color: "var(--error-light)" },
  HIGH: { background: "#FBBF2415", border: "1px solid #FBBF2440", color: "var(--warning-light)" },
  LOW: { background: "#70809615", border: "1px solid #70809640", color: "var(--text-muted-3)" },
};

export const statusStyle: Record<FindingRow["status"], { background: string; border: string; color: string }> = {
  fixed: { background: "#4ADE8015", border: "1px solid #4ADE8040", color: "var(--success)" },
  human: { background: "#C8340615", border: "1px solid #C8340640", color: "var(--accent)" },
};

// Real severity -> CSS token, matching severityStyle's own colors exactly
// (so the 3D scene's tile colors and the DOM table's pill colors are
// visually the same tokens, per the build spec's explicit requirement).
export const SEVERITY_TOKEN: Record<FindingRow["severity"], string> = {
  CRITICAL: "--error",
  HIGH: "--warning-light",
  LOW: "--text-muted-3",
};

export const CROSSES_GATE = FLAGGED.filter((r) => r.status === "fixed");
export const STOPPED_AT_WALL = FLAGGED.find((r) => r.status === "human");
if (!STOPPED_AT_WALL) {
  throw new Error("standing-watch-findings: expected exactly one 'human' status row (FileVault) — data changed?");
}
