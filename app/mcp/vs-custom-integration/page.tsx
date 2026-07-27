import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP vs. Custom Integration",
  description:
    "What actually changes when you connect an AI system to SAP, Salesforce, or Workday through MCP instead of a point-to-point custom integration — and where custom integration is still the right call.",
  openGraph: {
    title: "MCP vs. Custom Integration — Tioga AI",
    description:
      "What changes when you connect an AI system through MCP instead of a point-to-point custom integration.",
  },
};

interface Row {
  dimension: string;
  custom: string;
  mcp: string;
}

const ROWS: Row[] = [
  {
    dimension: "What you build",
    custom: "A bespoke code path per (system, use case) pair — a Salesforce-for-forecasting integration is a different artifact from a Salesforce-for-support-triage one.",
    mcp: "One tool server per system. Any use case, and any MCP-aware AI client, calls the same tools.",
  },
  {
    dimension: "Adding a second use case",
    custom: "Usually a second integration, even against the same system — the first one was wired to one workflow's shape.",
    mcp: "Usually zero new integration work — the new use case calls tools that already exist.",
  },
  {
    dimension: "Where the logic lives",
    custom: "Spread across whichever app or script needed that data at the time it was built.",
    mcp: "Centralized in the tool server, versioned and reviewed like the rest of your codebase.",
  },
  {
    dimension: "What the model can do",
    custom: "Only whatever a human wired up in advance — the model consumes data it's handed, it doesn't request more.",
    mcp: "The model decides which tools to call and in what order, based on what the question actually needs.",
  },
  {
    dimension: "Auth & access boundary",
    custom: "Defined per integration — easy for scope to drift wider than the original use case needed.",
    mcp: "Defined once per tool server, so every consumer of that server inherits the same boundary.",
  },
  {
    dimension: "Switching AI providers",
    custom: "Integration code is usually written against one model's function-calling format.",
    mcp: "MCP is a protocol, not a vendor's format — the tool server doesn't change if the client does.",
  },
];

export default function McpVsCustomIntegrationPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "#0A0F1C" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <a href="/mcp" className="text-xs mb-6 inline-block hover:text-white transition-colors" style={{ color: "#00D4FF" }}>
          ← MCP Integrations
        </a>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#00D4FF" }}
        >
          Comparison
        </div>
        <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
          MCP vs. custom integration: what actually changes
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed mb-12">
          Both approaches get an AI system reading and writing data in SAP,
          Salesforce, Workday, or whatever else runs the business. The
          difference isn&apos;t whether it works the first time — a
          well-built custom integration works fine for exactly the use case
          it was written for. The difference shows up the second time you
          need that same system connected to something new.
        </p>

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-3">The custom integration path</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This is a point-to-point job: pick the fields a specific
              workflow needs, write the auth and query logic against that
              system&apos;s API, and wire the result into that one prompt or
              application. It&apos;s the right default for a single, well-scoped
              use case, and there&apos;s no protocol tax to pay for it. The cost
              shows up later — the second consuming use case usually can&apos;t
              reuse the first one&apos;s integration, because it was shaped
              around a workflow, not around the system itself.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">What MCP changes</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              MCP (Model Context Protocol) inverts the shape of the work: you
              build a tool server for the system — <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#0D1526", color: "#00D4FF" }}>get_pending_invoices</code>,{" "}
              <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#0D1526", color: "#00D4FF" }}>get_employee_data</code>,{" "}
              <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#0D1526", color: "#00D4FF" }}>get_pipeline</code> — not around any one workflow. Any
              MCP-aware model can call those tools, decide which ones it
              needs for a given question, and chain them. The{" "}
              <a href="/mcp" style={{ color: "#00D4FF" }} className="hover:text-white transition-colors">
                live MCP demo
              </a>{" "}
              on this site shows the actual tool-server code for SAP,
              Workday, and Salesforce connectors written this way.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">Side by side</h2>
            <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid #1E2D4A" }}>
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0D1526" }}>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Dimension</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Custom integration</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "#00D4FF" }}>MCP</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r, i) => (
                    <tr key={r.dimension} style={{ borderTop: "1px solid #1E2D4A", background: i % 2 === 1 ? "#0A0F1C" : "transparent" }}>
                      <td className="p-4 text-white font-medium align-top whitespace-nowrap">{r.dimension}</td>
                      <td className="p-4 text-slate-400 leading-relaxed align-top">{r.custom}</td>
                      <td className="p-4 text-slate-300 leading-relaxed align-top">{r.mcp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC08)", border: "1px solid #00D4FF30" }}>
            <h2 className="text-lg font-bold text-white mb-3">Where custom integration is still the right call</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              A protocol layer is only worth its overhead if something is
              actually going to reuse it. If there&apos;s exactly one AI use
              case against a given system, with no second one on the
              roadmap, a direct integration is simpler to build and easier to
              reason about — MCP&apos;s advantage compounds with the number of
              use cases sharing a system, and it isn&apos;t free at n=1.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-slate-600 mb-4">
            See the pattern applied to a real workflow in the{" "}
            <a href="/engineering/migration-assessment" style={{ color: "#00D4FF" }} className="hover:text-white transition-colors">
              Migration Assessment writeup →
            </a>
          </p>
          <a
            href="/mcp"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            Try the live MCP demo →
          </a>
        </div>
      </section>
    </main>
  );
}
