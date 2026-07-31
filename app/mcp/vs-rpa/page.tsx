import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP vs. RPA",
  description:
    "MCP and RPA solve different problems — one automates repetitive UI actions, the other gives a reasoning model structured access to your systems. When each is the right tool.",
  openGraph: {
    title: "MCP vs. RPA — Tioga AI",
    description:
      "One automates repetitive UI actions. The other gives a reasoning model structured access to your systems. When each is the right tool.",
  },
};

interface Row {
  dimension: string;
  rpa: string;
  mcp: string;
}

const ROWS: Row[] = [
  {
    dimension: "What it automates",
    rpa: "A fixed sequence of UI actions — click here, type there, read this field — recorded once and replayed.",
    mcp: "A set of callable tools an LLM chooses among and combines based on the actual request, not a pre-recorded sequence.",
  },
  {
    dimension: "Where it operates",
    rpa: "In front of the application, at the UI layer — it interacts with screens the way a person would.",
    mcp: "Behind the application, at the API/data layer — it calls the same interfaces a developer would.",
  },
  {
    dimension: "What breaks it",
    rpa: "A moved button, a renamed field, a new modal — any UI change the script wasn't recorded against.",
    mcp: "A change to the underlying API contract the tool server was written against — the UI can change freely.",
  },
  {
    dimension: "Handling a request it wasn't built for",
    rpa: "Fails or does the wrong thing — the script has no model of what it's doing, only what to click next.",
    mcp: "The model can reason about the request and decide which tools apply, including combinations the tool server's author didn't anticipate.",
  },
  {
    dimension: "Best fit",
    rpa: "High-volume, well-defined, repetitive tasks against a system with no usable API — especially legacy client-server apps.",
    mcp: "Tasks that need judgment about which action applies, or that mix data from several systems in ways that vary per request.",
  },
];

export default function McpVsRpaPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <section className="pt-36 pb-20 px-6 max-w-3xl mx-auto">
        <a href="/mcp" className="text-xs mb-6 inline-block hover:text-white transition-colors" style={{ color: "var(--accent)" }}>
          ← MCP Integrations
        </a>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
        >
          Comparison
        </div>
        <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
          MCP vs. RPA: not actually competing tools
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed mb-12">
          These get lumped together because both showed up in the same
          &quot;automate the business&quot; conversation, but they solve
          different problems. RPA replays a recorded action against a UI. MCP
          gives a reasoning model structured access to a system so it can
          decide what to do. The question isn&apos;t which one is better —
          it&apos;s which problem you actually have.
        </p>

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-3">What RPA does well</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Robotic process automation records a human&apos;s clicks and
              keystrokes against an application&apos;s UI and replays them —
              log in, open this screen, copy this field, paste it there,
              submit. For a high-volume, repetitive task against a system
              with no usable API, especially an old client-server app that
              was never going to get one, that&apos;s still the right tool.
              There&apos;s no reasoning involved, and for a task that doesn&apos;t
              need any, that&apos;s a feature, not a gap.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">Where it runs into trouble</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              An RPA script has no model of what it&apos;s doing — it knows
              coordinates and field names, not intent. Move a button, rename
              a field, add a confirmation dialog, and the script breaks until
              someone re-records it. And it can only ever do exactly what it
              was recorded to do; a request one step outside that script
              isn&apos;t handled poorly, it&apos;s not handled at all.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">What MCP does instead</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              MCP doesn&apos;t touch the UI at all. It exposes a system&apos;s
              actual capabilities — <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)", color: "var(--accent)" }}>get_pending_invoices</code>,{" "}
              <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)", color: "var(--accent)" }}>get_employee_data</code> — as tools a model can call. The
              model decides which tools a given request needs and in what
              order, so it can handle requests the tool server&apos;s author
              never explicitly scripted, as long as the underlying tools
              exist. See{" "}
              <a href="/mcp/vs-custom-integration" style={{ color: "var(--accent)" }} className="hover:text-white transition-colors">
                MCP vs. custom integration →
              </a>{" "}
              for how that compares to building the same thing by hand.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">Side by side</h2>
            <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--border)" }}>
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-card)" }}>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Dimension</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">RPA</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>MCP</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r, i) => (
                    <tr key={r.dimension} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 1 ? "var(--bg-dark)" : "transparent" }}>
                      <td className="p-4 text-white font-medium align-top whitespace-nowrap">{r.dimension}</td>
                      <td className="p-4 text-slate-400 leading-relaxed align-top">{r.rpa}</td>
                      <td className="p-4 text-slate-300 leading-relaxed align-top">{r.mcp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC08)", border: "1px solid #00D4FF30" }}>
            <h2 className="text-lg font-bold text-white mb-3">They&apos;re often used together</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              A lot of real enterprise environments have both problems at
              once: bulk, repetitive data entry into a system with no API
              (RPA&apos;s job), and a request that needs to reason across
              several of those systems to answer a question or make a
              judgment call (MCP&apos;s job). Replacing working RPA with an
              agentic layer for tasks that never needed judgment is just
              added complexity — the two aren&apos;t a migration path from one
              to the other.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-slate-600 mb-4">
            See the same tradeoff against building integrations by hand in{" "}
            <a href="/mcp/vs-custom-integration" style={{ color: "var(--accent)" }} className="hover:text-white transition-colors">
              MCP vs. custom integration →
            </a>
          </p>
          <a
            href="/mcp"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Try the live MCP demo →
          </a>
        </div>
      </section>
    </main>
  );
}
