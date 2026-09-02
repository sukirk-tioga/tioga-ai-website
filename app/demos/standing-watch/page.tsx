import type { Metadata } from "next";
import Link from "next/link";
import DemoShell from "../_lib/demo-shell";

export const metadata: Metadata = {
  title: "Standing Watch Demo — Tioga AI",
  description:
    "Real, dated excerpts from Tioga AI's own operating governance automations — router-watch and security-watch — showing propose-only findings, a human-reviewed fix, and a same-day remediation sequence.",
  alternates: { canonical: "/demos/standing-watch" },
  openGraph: {
    title: "Standing Watch Demo — Tioga AI",
    description:
      "Real operational data, redacted — not a live-refreshing feed. Propose-and-approve governance, including what the system correctly refuses to do itself.",
  },
};

// Real excerpts from Tioga's own operating governance automations, captured
// 2026-08-10. Router-watch and security-watch are the automations Standing
// Watch's disciplines are generalized from. Network-identifying details
// (real hostnames, IPs, ports beyond the finding itself) have been redacted
// or generalized to device class ([internal-host-1], "Mac Mini", "MacBook")
// — dates, severities, CVE IDs, and the narrative arc are real and unedited.

interface FindingRow {
  severity: "CRITICAL" | "HIGH" | "LOW";
  host: string;
  finding: string;
  status: "fixed" | "human";
  note: string;
}

const FLAGGED: FindingRow[] = [
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

const RAW_COUNTS = [
  { label: "Critical", value: "1", color: "var(--error)" },
  { label: "High", value: "27", color: "var(--warning-light)" },
  { label: "Medium", value: "4", color: "var(--warning)" },
  { label: "Low", value: "33", color: "var(--text-muted-3)" },
];

const severityStyle: Record<string, { background: string; border: string; color: string }> = {
  CRITICAL: { background: "#EF444420", border: "1px solid var(--error)", color: "var(--error-light)" },
  HIGH: { background: "#FBBF2415", border: "1px solid #FBBF2440", color: "var(--warning-light)" },
  LOW: { background: "#70809615", border: "1px solid #70809640", color: "var(--text-muted-3)" },
};

const statusStyle: Record<string, { background: string; border: string; color: string }> = {
  fixed: { background: "#4ADE8015", border: "1px solid #4ADE8040", color: "var(--success)" },
  human: { background: "#EC6D3D15", border: "1px solid #EC6D3D40", color: "var(--accent)" },
};

export default function StandingWatchDemoPage() {
  return (
    <DemoShell
      title="Standing Watch"
      badge="Real Operational Data — Redacted, Dated, Not a Mockup"
      description="Two real excerpts from the automations Tioga runs on its own infrastructure — router-watch and security-watch — captured Aug 10, 2026. Both are propose-only: nothing here writes to live configuration itself."
    >
      <p className="text-xs mb-6 -mt-4" style={{ color: "var(--text-muted-3)" }}>
        Redaction note: hostnames, IPs, and specific network topology below are
        replaced with placeholders like <code className="font-mono">[internal-host-1]</code>.
        Dates, severities, CVE IDs, and the real narrative — discovered → proposed →
        human-reviewed → fixed → verified — are unedited.
      </p>

      {/* ── Router-watch ── */}
      <div className="rounded-2xl overflow-hidden mb-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">Router-watch — Aug 10, 2026</h2>
            <p className="text-xs text-slate-400 mt-1">
              Weekly scan of the model catalog for cheaper or better-fit swaps, and for registry
              pricing that&apos;s gone stale against what vendors actually charge.
            </p>
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap"
            style={{ background: "#FBBF2415", border: "1px solid #FBBF2440", color: "var(--warning-light)" }}
          >
            Decay signal
          </span>
        </div>

        <div className="px-5 pb-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-4 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1.5">Catalog scanned</p>
              <p className="text-xl font-bold text-white font-mono">399 models</p>
              <p className="text-xs text-slate-400 mt-1">OpenRouter — none cleared Stage 1 this run</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1.5">Stage 2 threshold</p>
              <p className="text-xl font-bold text-white font-mono">$0.1500</p>
              <p className="text-xs text-slate-400 mt-1">gemini-flash&apos;s pool-weighted price</p>
            </div>
          </div>

          <p className="text-xs font-medium mb-2" style={{ color: "var(--accent)" }}>Incumbent decay signal</p>
          <div className="rounded-xl p-4 mb-4 font-mono text-xs leading-relaxed" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <p>gpt-terra: REGISTRY in_price $2.50 vs live $1.00 <span style={{ color: "var(--success)" }}>(-60%)</span></p>
            <p>gpt-terra: REGISTRY out_price $15.00 vs live $6.00 <span style={{ color: "var(--success)" }}>(-60%)</span></p>
          </div>

          <div className="rounded-xl p-4" style={{ background: "#EC6D3D08", border: "1px solid #EC6D3D20" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--accent)" }}>→ Propose-only. No config auto-changed.</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              The report&apos;s own footer: &ldquo;This report is a PROPOSAL. No file was modified by
              this job. To adopt a swap, hand-edit the router config, run the test suite, and
              restart the gateway.&rdquo; A human reviewed this exact finding and applied the pricing
              refresh by hand — the automation never touches live routing config itself.
            </p>
          </div>
        </div>
      </div>

      {/* ── Security-watch ── */}
      <div className="rounded-2xl overflow-hidden mb-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">Security-watch — Aug 10, 2026</h2>
            <p className="text-xs text-slate-400 mt-1">
              Weekly findings sweep across both machines in scope — auth gaps, exposed listeners,
              disk encryption, and package CVEs.
            </p>
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap"
            style={{ background: "#EF444420", border: "1px solid var(--error)", color: "var(--error-light)" }}
          >
            Critical
          </span>
        </div>

        <div className="px-5 pb-2">
          <p className="text-xs text-slate-400 mb-3">
            Full raw ledger from this run, by severity — the 9 rows below are the subset flagged
            for action that same day, not the whole ledger.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {RAW_COUNTS.map((c) => (
              <div key={c.label} className="p-3 rounded-xl text-center" style={{ background: "var(--bg-dark)", border: "1px solid var(--border)" }}>
                <p className="text-lg font-bold font-mono" style={{ color: c.color }}>{c.value}</p>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--accent)" }}>
            Flagged for action — remediation walked one at a time, same session (8 of a 9-item
            set drawn from this report; a 10th item, tightening the router&apos;s own firewall
            rules, was flagged the same day but sits outside this report and outside anything
            reachable from either machine — see below)
          </p>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm" style={{ minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Sev", "Host", "Finding", "Outcome"].map((h) => (
                    <th key={h} className="text-left text-[11px] text-slate-400 uppercase tracking-wide font-medium px-3 py-2 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FLAGGED.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i === FLAGGED.length - 1 ? "none" : "1px solid var(--border)", background: "var(--bg-dark)" }}>
                    <td className="px-3 py-2.5 align-top whitespace-nowrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide" style={severityStyle[row.severity]}>
                        {row.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top font-mono text-xs text-slate-400 whitespace-nowrap">{row.host}</td>
                    <td className="px-3 py-2.5 align-top text-slate-300">
                      <p>{row.finding}</p>
                      <p className="text-xs text-slate-400 mt-1">{row.note}</p>
                    </td>
                    <td className="px-3 py-2.5 align-top whitespace-nowrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={statusStyle[row.status]}>
                        {row.status === "fixed" ? "Fixed & verified" : "Left for human"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why the 2 human-only items matter */}
        <div className="mx-5 mb-5 rounded-xl p-4" style={{ background: "#EC6D3D08", border: "1px solid #EC6D3D20" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--accent)" }}>
            → 8 of 10 flagged items fixed and verified live. 2 correctly left for a human.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            FileVault wasn&apos;t skipped by accident — enabling disk encryption needs Recovery Mode
            / physical console access, which nothing the automation runs with can reach. The same
            day, a separate item — tightening the home router&apos;s own firewall rules to match the
            host-level hardening above — was flagged and correctly left alone for the same reason:
            it needs the router&apos;s own admin UI, not anything scriptable from either machine. The
            system flags what it can&apos;t safely act on and says so, instead of silently skipping it
            or reaching for access it shouldn&apos;t have. That&apos;s the same discipline as the
            propose-only router-watch finding above, applied to a case where the honest answer is
            &ldquo;a human has to do this part.&rdquo;
          </p>
        </div>
      </div>

      {/* Offer tie-in */}
      <div className="mt-6 p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-sm text-slate-300 leading-relaxed">
          This propose-and-approve discipline — findings that age instead of disappearing, fixes a
          human reviews and applies, and a system that knows the edge of its own authority — is
          what Standing Watch generalizes to a multi-vendor enterprise estate.
        </p>
        <p className="text-xs text-slate-500 mt-3">
          This is one incident, in full detail. For the ongoing, aggregate record across the whole
          estate, see{" "}
          <Link href="/demos/automation-oversight" className="hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
            Automation Oversight →
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            "Standing Watch Assessment — $15–35K",
            "Standing Watch Build — $60–150K",
            "Standing Watch Retainer — $5–15K/month",
          ].map((o) => (
            <a
              key={o}
              href="/solutions/standing-watch"
              className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:border-slate-500"
              style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              {o}
            </a>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
