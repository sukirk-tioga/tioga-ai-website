"use client";

import { useState, useEffect, useRef } from "react";

// ── Animated flow line component ──────────────────────────────────────────────

function FlowDot({ delay = 0, color = "#00D4FF" }: { delay?: number; color?: string }) {
  return (
    <span
      className="absolute w-1.5 h-1.5 rounded-full"
      style={{
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animation: `flowRight 2s ${delay}s infinite linear`,
      }}
    />
  );
}

// ── Architecture Diagram ──────────────────────────────────────────────────────

function ArchDiagram() {
  const nodes = [
    { id: "user", label: "User", sub: "Natural language", icon: "👤", color: "#64748b" },
    { id: "claude", label: "Claude", sub: "AI reasoning layer", icon: "✦", color: "#00D4FF" },
    { id: "mcp", label: "MCP Server", sub: "Tool orchestration", icon: "⬡", color: "#00D4FF" },
  ];

  const systems = [
    { label: "SAP", sub: "Finance / ERP", icon: "💼", color: "#F59E0B" },
    { label: "PeopleSoft", sub: "HR / Workforce", icon: "👥", color: "#10B981" },
    { label: "Salesforce", sub: "CRM / Pipeline", icon: "☁", color: "#3B82F6" },
    { label: "ServiceNow", sub: "IT / Ticketing", icon: "🔧", color: "#8B5CF6" },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl p-6" style={{ background: "#060B14", border: "1px solid #1E2D4A" }}>
      <style>{`
        @keyframes flowRight {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: calc(100% - 6px); opacity: 0; }
        }
        @keyframes flowDown {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: calc(100% - 6px); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px #00D4FF30; }
          50% { box-shadow: 0 0 25px #00D4FF60; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top row: User → Claude → MCP */}
      <div className="flex items-center justify-between mb-8">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center flex-1">
            {/* Node */}
            <div
              className="flex flex-col items-center text-center flex-shrink-0"
              style={{ animation: `fadeInUp 0.5s ${i * 0.15}s both` }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl mb-2 font-mono"
                style={{
                  background: `${node.color}15`,
                  border: `1px solid ${node.color}40`,
                  animation: node.id === "claude" ? "pulse-glow 2s infinite" : undefined,
                  color: node.color,
                }}
              >
                {node.icon}
              </div>
              <p className="text-xs font-semibold text-white">{node.label}</p>
              <p className="text-xs text-slate-500">{node.sub}</p>
            </div>

            {/* Connector arrow */}
            {i < nodes.length - 1 && (
              <div className="flex-1 mx-3 relative h-0.5 flex items-center" style={{ background: "#1E2D4A" }}>
                <FlowDot delay={i * 0.7} />
                <FlowDot delay={i * 0.7 + 0.5} />
                <span className="absolute right-0 text-slate-600 text-xs">▶</span>
                {/* Label */}
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-slate-600 whitespace-nowrap font-mono">
                  {i === 0 ? "query" : "tool_call()"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vertical connector from MCP down */}
      <div className="flex justify-end mb-4 pr-7">
        <div className="relative w-0.5 h-8" style={{ background: "#1E2D4A" }}>
          <span
            className="absolute w-1.5 h-1.5 rounded-full left-1/2 -translate-x-1/2"
            style={{
              background: "#00D4FF",
              boxShadow: "0 0 6px #00D4FF",
              animation: "flowDown 2s 0.3s infinite linear",
            }}
          />
        </div>
      </div>

      {/* Bottom row: Enterprise systems */}
      <div className="grid grid-cols-4 gap-3">
        {systems.map((sys, i) => (
          <div
            key={sys.label}
            className="p-3 rounded-xl text-center"
            style={{
              background: `${sys.color}08`,
              border: `1px solid ${sys.color}30`,
              animation: `fadeInUp 0.5s ${0.5 + i * 0.1}s both`,
            }}
          >
            <div className="text-lg mb-1">{sys.icon}</div>
            <p className="text-xs font-semibold text-white">{sys.label}</p>
            <p className="text-xs text-slate-500">{sys.sub}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ background: "#00D4FF" }} />
          <span className="text-xs text-slate-500">MCP protocol</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#00D4FF", boxShadow: "0 0 6px #00D4FF" }} />
          <span className="text-xs text-slate-500">live data flow</span>
        </div>
      </div>
    </div>
  );
}

// ── Code snippet ──────────────────────────────────────────────────────────────

const CODE_EXAMPLES = [
  {
    label: "SAP Integration",
    lang: "python",
    code: `# Tioga AI MCP Server — SAP connector
@mcp.tool()
async def get_pending_invoices(
    vendor: str = None,
    min_amount: float = None
) -> list[Invoice]:
    """Fetch pending invoices from SAP"""
    return await sap_client.query(
        module="FI",
        filters={"STATUS": "PENDING", 
                 "VENDOR": vendor,
                 "AMOUNT_GTE": min_amount}
    )

# Claude can now call this naturally:
# "Show me all pending invoices over $10k from CloudStack"`,
  },
  {
    label: "PeopleSoft",
    lang: "python",
    code: `# Tioga AI MCP Server — PeopleSoft connector
@mcp.tool()
async def get_employee_data(
    dept: str = None,
    location: str = None
) -> list[Employee]:
    """Query PeopleSoft employee records"""
    return await ps_client.query(
        component="EMPLOYEE",
        dept=dept,
        location=location,
        fields=["EMP_ID","NAME","TITLE","STATUS"]
    )

# Claude can now answer:
# "How many engineers do we have in SF?"`,
  },
  {
    label: "Salesforce",
    lang: "python",
    code: `# Tioga AI MCP Server — Salesforce connector
@mcp.tool()
async def get_pipeline(
    stage: str = None,
    min_value: float = None
) -> PipelineSummary:
    """Get CRM opportunity pipeline"""
    return await sf_client.soql(
        f"""SELECT Id, Name, Amount, Stage, 
            CloseDate FROM Opportunity
            WHERE StageName = '{stage}'
            AND Amount >= {min_value}"""
    )

# Claude can now answer:
# "What deals are closing this month over $50k?"`,
  },
];

function CodeBlock() {
  const [active, setActive] = useState(0);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#060B14", border: "1px solid #1E2D4A" }}>
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1px solid #1E2D4A" }}>
        {CODE_EXAMPLES.map((ex, i) => (
          <button
            key={ex.label}
            onClick={() => setActive(i)}
            className="px-4 py-2.5 text-xs font-medium transition-all"
            style={{
              color: active === i ? "#00D4FF" : "#64748b",
              borderBottom: active === i ? "2px solid #00D4FF" : "2px solid transparent",
              background: "transparent",
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>
      {/* Code */}
      <pre
        className="p-5 text-xs leading-relaxed overflow-x-auto font-mono"
        style={{ color: "#94a3b8" }}
      >
        {CODE_EXAMPLES[active].code.split("\n").map((line, i) => {
          const isComment = line.trim().startsWith("#");
          const isDecorator = line.trim().startsWith("@");
          const isKeyword = /\b(async|def|await|return|from|import)\b/.test(line);
          return (
            <div key={i}>
              <span style={{
                color: isComment ? "#475569" : isDecorator ? "#F59E0B" : isKeyword ? "#00D4FF" : "#94a3b8"
              }}>
                {line || " "}
              </span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

// ── Live MCP Demo ─────────────────────────────────────────────────────────────

const SAMPLE_QUERIES = [
  "Show me all pending invoices over $5,000",
  "Who are our active employees in San Francisco?",
  "What deals are closing this quarter?",
  "What's our total pipeline value?",
  "How many employees do we have?",
];

interface MCPMessage {
  role: "user" | "assistant";
  content: string;
  mcpCalls?: { tools: string[]; system: string };
}

function LiveDemo() {
  const [messages, setMessages] = useState<MCPMessage[]>([
    {
      role: "assistant",
      content: "I'm connected to your enterprise systems via MCP. Ask me anything about your SAP invoices, PeopleSoft employees, or Salesforce pipeline.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const send = async (query: string) => {
    if (!query.trim() || loading) return;
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: query }]);

    try {
      const res = await fetch("/api/mcp-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: json.answer,
        mcpCalls: json.mcpCalls,
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, the demo encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#060B14", border: "1px solid #1E2D4A" }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid #1E2D4A" }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10B981" }} />
        </div>
        <span className="text-xs font-mono text-slate-500">claude + mcp-server → enterprise</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-500">3 systems connected</span>
        </div>
      </div>

      {/* Connected systems pill row */}
      <div className="px-4 py-2 flex gap-2" style={{ borderBottom: "1px solid #0D1526" }}>
        {[
          { label: "SAP", color: "#F59E0B" },
          { label: "PeopleSoft", color: "#10B981" },
          { label: "Salesforce", color: "#3B82F6" },
        ].map((s) => (
          <span
            key={s.label}
            className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}
          >
            ● {s.label}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 overflow-y-auto" style={{ height: "280px" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%]">
              <div
                className="rounded-xl px-4 py-2.5 text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? { background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#e2e8f0" }
                    : { background: "#0D1526", border: "1px solid #1E2D4A", color: "#cbd5e1" }
                }
              >
                {msg.content}
              </div>
              {/* MCP call badge */}
              {msg.mcpCalls && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {msg.mcpCalls.tools.map((tool: string) => (
                    <span
                      key={tool}
                      className="text-xs px-2 py-0.5 rounded-md font-mono"
                      style={{ background: "#00D4FF08", color: "#00D4FF80", border: "1px solid #00D4FF20" }}
                    >
                      ⚡ {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl px-4 py-3" style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}>
              <div className="flex gap-1 items-center">
                <span className="text-xs text-slate-500 font-mono mr-2">querying systems</span>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sample queries */}
      <div className="px-4 py-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid #0D1526" }}>
        {SAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={loading}
            className="text-xs px-2.5 py-1 rounded-lg transition-all hover:border-slate-500 disabled:opacity-40"
            style={{ background: "#0A0F1C", border: "1px solid #1E2D4A", color: "#64748b" }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2" style={{ borderTop: "1px solid #1E2D4A" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask anything about your enterprise data..."
          disabled={loading}
          className="flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 outline-none font-mono"
          style={{ background: "#0A0F1C", border: "1px solid #1E2D4A" }}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Before / After comparison ─────────────────────────────────────────────────

function Comparison() {
  const rows = [
    { topic: "Query data", before: "Write SQL / ABAP / SOQL", after: "Ask in plain English" },
    { topic: "Integration", before: "Custom API per system", after: "One MCP server" },
    { topic: "Updates", before: "Re-engineer on API change", after: "Update tool definition" },
    { topic: "Access control", before: "Manage per-system tokens", after: "Centralized MCP auth" },
    { topic: "New systems", before: "Weeks of integration work", after: "Add a tool, deploy" },
    { topic: "Audit trail", before: "Scattered across systems", after: "Single MCP log" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Before */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #EF444430" }}>
        <div className="px-4 py-3 text-sm font-semibold text-red-400" style={{ background: "#EF444408", borderBottom: "1px solid #EF444430" }}>
          ✗ Before MCP
        </div>
        <div className="divide-y" style={{ borderColor: "#EF444420" }}>
          {rows.map((r) => (
            <div key={r.topic} className="px-4 py-3">
              <p className="text-xs text-slate-500 mb-0.5">{r.topic}</p>
              <p className="text-sm text-slate-300">{r.before}</p>
            </div>
          ))}
        </div>
      </div>

      {/* After */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #00D4FF30" }}>
        <div className="px-4 py-3 text-sm font-semibold" style={{ color: "#00D4FF", background: "#00D4FF08", borderBottom: "1px solid #00D4FF30" }}>
          ✓ After MCP
        </div>
        <div className="divide-y" style={{ borderColor: "#00D4FF15" }}>
          {rows.map((r) => (
            <div key={r.topic} className="px-4 py-3">
              <p className="text-xs text-slate-500 mb-0.5">{r.topic}</p>
              <p className="text-sm text-slate-300">{r.after}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MCPPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "#0A0F1C" }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeInUp 0.6s both; }
        .fade-in-1 { animation-delay: 0.1s; }
        .fade-in-2 { animation-delay: 0.2s; }
        .fade-in-3 { animation-delay: 0.3s; }
      `}</style>

      <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16 fade-in">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5 font-mono"
            style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#00D4FF" }}
          >
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            Model Context Protocol
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Let Claude talk to your<br />
            <span style={{ color: "#00D4FF" }}>enterprise systems</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-6">
            MCP is the open protocol that connects AI to your real business data.
            Instead of building custom integrations for every system, you build once —
            and Claude can query SAP, PeopleSoft, Salesforce, and more in plain English.
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-sm text-slate-400">
            {["Open standard by Anthropic", "Works with any LLM", "Enterprise-grade security", "Tioga AI certified"].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <span style={{ color: "#00D4FF" }}>✓</span> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Architecture diagram */}
        <div className="mb-16 fade-in fade-in-1">
          <h2 className="text-xl font-bold text-white mb-2">How MCP Works</h2>
          <p className="text-slate-400 text-sm mb-5">
            A single MCP server sits between Claude and all your enterprise systems.
            Claude calls tools, MCP handles auth and routing, your systems return data.
          </p>
          <ArchDiagram />
        </div>

        {/* Live Demo */}
        <div className="mb-16 fade-in fade-in-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Live Demo</h2>
              <p className="text-slate-400 text-sm">
                Claude is connected to mock SAP, PeopleSoft, and Salesforce instances.
                Ask it anything — watch it call the right system automatically.
              </p>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-mono ml-4 flex-shrink-0"
              style={{ background: "#10B98115", border: "1px solid #10B98130", color: "#10B981" }}
            >
              ● mock data
            </div>
          </div>
          <LiveDemo />
        </div>

        {/* Before / After */}
        <div className="mb-16 fade-in fade-in-3">
          <h2 className="text-xl font-bold text-white mb-2">Before & After</h2>
          <p className="text-slate-400 text-sm mb-5">
            Traditional enterprise integrations require custom code per system.
            MCP replaces all of that with a single, standardized layer.
          </p>
          <Comparison />
        </div>

        {/* Code examples */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2">What We Build</h2>
          <p className="text-slate-400 text-sm mb-5">
            Tioga AI builds and maintains your MCP servers. Here's what our connectors look like —
            each tool is a typed function Claude can call by name.
          </p>
          <CodeBlock />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {[
            { stat: "< 2 weeks", label: "to first MCP integration" },
            { stat: "10+", label: "enterprise connectors built" },
            { stat: "Zero", label: "custom APIs per system" },
          ].map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-2xl text-center"
              style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}
            >
              <p className="text-2xl font-bold mb-1" style={{ color: "#00D4FF" }}>{s.stat}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC08)", border: "1px solid #00D4FF30" }}
        >
          <h2 className="text-2xl font-bold text-white mb-3">Ready to connect your enterprise?</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            We'll scope your integration in a 5-day discovery sprint and have your first
            MCP connector live within 2 weeks.
          </p>
          <a
            href="/#contact"
            className="inline-flex px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            Start a Discovery Sprint
          </a>
          <p className="text-xs text-slate-600 mt-3">$5,000 flat · 5 days · prototype included</p>
        </div>
      </div>
    </main>
  );
}
