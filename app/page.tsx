import SmartContactForm from "@/components/SmartContactForm";

export default function HomePage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "#0A0F1C" }}>

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(10,15,28,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid #1E2D4A" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            T
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">tioga.ai</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#services" className="hover:text-white transition-colors">Services</a>
          <a href="/demos" className="hover:text-white transition-colors">Live Demos</a>
          <a href="/mcp" className="hover:text-white transition-colors">MCP</a>
          <a href="#process" className="hover:text-white transition-colors">Process</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <a
          href="#contact"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
        >
          Get Started
        </a>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #00D4FF, transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#00D4FF" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Enterprise AI Implementation Partner
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
          AI that works<br />
          <span style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            in production
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-3 leading-relaxed">
          Most enterprise AI projects fail at integration. We specialize in delivery — connecting LLMs to your SAP, Salesforce, PeopleSoft, and ServiceNow environments so teams actually use them.
        </p>
        <p className="text-sm text-slate-500 max-w-xl mx-auto mb-10">
          5-day discovery sprint. 2–4 week pilot. Production-ready from day one.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <a
            href="/demos"
            className="px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            See Live Demos
          </a>
          <a
            href="#contact"
            className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-white"
            style={{ border: "1px solid #1E2D4A", color: "#94a3b8" }}
          >
            Start a Conversation
          </a>
        </div>
        <p className="text-xs text-slate-600">Or click the chat bubble ↘ to talk to our AI assistant right now</p>
      </section>

      {/* Stats Bar */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ background: "#1E2D4A" }}>
          {[
            { value: "5 days", label: "Discovery Sprint" },
            { value: "2–4 wks", label: "Pilot to Production" },
            { value: "100%", label: "Real System Integration" },
            { value: "SOC2", label: "Enterprise Ready" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-5 text-center" style={{ background: "#0D1526" }}>
              <div className="text-2xl font-bold mb-1" style={{ color: "#00D4FF" }}>{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div
          className="p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start"
          style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC08)", border: "1px solid #00D4FF20" }}
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">The integration problem</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enterprise AI projects stall because generic consultants build demos that can&apos;t connect to real systems. Your ERP, CRM, and HRIS are locked behind custom APIs, legacy auth, and security layers that require deep enterprise expertise to navigate.
            </p>
          </div>
          <div className="hidden md:block w-px self-stretch" style={{ background: "#1E2D4A" }} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">The Tioga difference</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We build MCP-native AI systems that speak your enterprise stack&apos;s language from day one. Your pilot runs on your real data, in your real environment — so the path to production is already built by the time we present results.
            </p>
          </div>
        </div>
      </section>

      {/* Try It Live */}
      <section className="py-4 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: "#00D4FF10", border: "1px solid #00D4FF25", color: "#00D4FF" }}
          >
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            Live on our production API
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Try It Right Now</h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm">Three real AI workflows. No signup. No mockups. The same Claude models we deploy for enterprise clients.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: "📄",
              title: "Invoice Processing",
              desc: "Upload a PDF. Get structured vendor, amount, and line-item data in under 5 seconds.",
              tag: "AP Automation",
              href: "/demos?tab=invoice"
            },
            {
              icon: "📧",
              title: "Email Triage",
              desc: "Paste any email. AI classifies urgency, routes to the right team, drafts a response.",
              tag: "Operations",
              href: "/demos?tab=email"
            },
            {
              icon: "📋",
              title: "Document Classification",
              desc: "Upload any document. Instantly identify type, extract key entities, suggest next actions.",
              tag: "Document Processing",
              href: "/demos?tab=document"
            },
          ].map((demo) => (
            <a
              key={demo.title}
              href={demo.href}
              className="group p-6 rounded-2xl transition-all hover:border-slate-500 cursor-pointer block"
              style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{demo.icon}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "#00D4FF10", color: "#00D4FF", border: "1px solid #00D4FF25" }}
                >
                  {demo.tag}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{demo.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{demo.desc}</p>
              <span className="text-sm font-medium inline-flex items-center gap-1.5" style={{ color: "#00D4FF" }}>
                Try it live →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <p className="text-center text-xs text-slate-600 uppercase tracking-widest mb-8">We integrate with your existing enterprise stack</p>
        <div className="flex flex-wrap justify-center items-center gap-3">
          {["SAP", "PeopleSoft", "Salesforce", "ServiceNow", "Oracle", "Workday", "SharePoint", "Slack"].map((name) => (
            <div
              key={name}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
              style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}
            >
              {name}
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderColor: "#1E2D4A", margin: "0 auto", maxWidth: "80%", borderTop: "1px solid" }} />

      {/* Services */}
      <section id="services" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">What We Build</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">Production AI systems — not prototypes — that integrate with your existing stack and deliver measurable ROI within the pilot.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              icon: "🤖",
              title: "Custom AI Agents",
              desc: "Bespoke agents that automate complex multi-step workflows, handle exceptions intelligently, and integrate with your enterprise systems. Built for reliability, not demos.",
              outcomes: ["Workflow automation", "Exception handling", "ERP integration"],
            },
            {
              icon: "🔗",
              title: "MCP Integrations",
              desc: "Connect Claude and other frontier LLMs to your SAP, PeopleSoft, Salesforce, or ServiceNow environments via Model Context Protocol — the new standard for AI-to-system connections.",
              outcomes: ["Natural language to action", "Secure data access", "Any LLM compatible"],
            },
            {
              icon: "📊",
              title: "AI Strategy Consulting",
              desc: "Discovery workshops, POC development, ROI analysis, and AI roadmapping — so your organization invests in the right problems and avoids costly misdirection.",
              outcomes: ["ROI-first prioritization", "Proof of concepts", "Implementation roadmap"],
            },
            {
              icon: "🎓",
              title: "AI Training & Enablement",
              desc: "Upskill your team on prompt engineering, AI governance, and responsible deployment. Make sure your organization can sustain and evolve its AI investments independently.",
              outcomes: ["Prompt engineering", "AI governance", "Team certification"],
            },
          ].map((s) => (
            <div
              key={s.title}
              className="p-7 rounded-2xl hover:border-slate-600 transition-all"
              style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}
            >
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{s.desc}</p>
              <div className="flex flex-wrap gap-2">
                {s.outcomes.map((o) => (
                  <span
                    key={o}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "#1E2D4A", color: "#64748b" }}
                  >
                    {o}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Tioga */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="rounded-2xl p-8 md:p-10" style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Why enterprises choose Tioga AI</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">We&apos;re not a generic AI consultancy. We specialize in one thing: getting AI into production inside complex enterprise environments.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "⚡", title: "Speed to value", desc: "Our 5-day discovery sprint gives you a working prototype and a delivery plan before most firms finish scoping." },
              { icon: "🔐", title: "Enterprise-grade security", desc: "SOC2-ready architecture, role-based access, audit logging, and your data never leaves your environment." },
              { icon: "🎯", title: "Integration-first approach", desc: "We build for your stack from day one. No rip-and-replace. Your existing systems become more powerful." },
              { icon: "🧪", title: "No toy demos", desc: "Every pilot runs against your real data and real systems. When it works in the pilot, it works in production." },
              { icon: "📐", title: "MCP-native builds", desc: "We specialize in Model Context Protocol — the emerging standard for connecting AI to enterprise systems at scale." },
              { icon: "📈", title: "Measurable ROI", desc: "We define success metrics before we start. You see ROI calculations in the pilot, not after a 6-month engagement." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderColor: "#1E2D4A", margin: "0 auto", maxWidth: "80%", borderTop: "1px solid" }} />

      {/* Process */}
      <section id="process" className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Our Process</h2>
          <p className="text-slate-400 text-sm">From first conversation to production deployment — with no ambiguity about what happens next.</p>
        </div>
        <div className="space-y-4">
          {[
            {
              step: "01", title: "Discovery Sprint", duration: "5 days",
              desc: "We map your systems, identify the highest-ROI AI opportunities, and define a clear scope with your team. You get a working prototype and a detailed delivery plan — before any large commitment.",
              detail: "System audit · Use-case prioritization · Prototype · Delivery plan"
            },
            {
              step: "02", title: "Pilot Build", duration: "2–4 weeks",
              desc: "We build a production-ready proof of concept integrated with your real systems. No toy demos — this runs against live data and real integrations. You see exactly what the full system will do.",
              detail: "Full integration · Real data · Stakeholder review · Go/no-go decision"
            },
            {
              step: "03", title: "Deploy & Scale", duration: "Ongoing",
              desc: "Full production deployment with monitoring, SLAs, ongoing support retainers, and continuous improvement as your AI needs grow. We stay partners, not vendors.",
              detail: "Production deploy · Monitoring · Support SLA · Continuous improvement"
            },
          ].map((p) => (
            <div key={p.step} className="flex gap-6 p-7 rounded-2xl" style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}>
              <div className="text-2xl font-bold font-mono shrink-0 mt-0.5" style={{ color: "#00D4FF" }}>{p.step}</div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "#00D4FF15", color: "#00D4FF", border: "1px solid #00D4FF30" }}
                  >
                    {p.duration}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-2">{p.desc}</p>
                <p className="text-xs text-slate-600">{p.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MCP Callout */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <a
          href="/mcp"
          className="block rounded-2xl p-8 transition-all hover:border-slate-500 group"
          style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC12)", border: "1px solid #00D4FF25" }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
                style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#00D4FF" }}
              >
                New Standard
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Model Context Protocol (MCP)</h3>
              <p className="text-sm text-slate-400 max-w-lg">
                MCP is how frontier AI connects to enterprise systems. We&apos;re one of the first implementation partners building production MCP integrations for SAP, PeopleSoft, and Salesforce. See the architecture, explore live demos, and understand why your next AI project should be MCP-native.
              </p>
            </div>
            <div
              className="shrink-0 px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all group-hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)", color: "white" }}
            >
              Explore MCP →
            </div>
          </div>
        </a>
      </section>

      <div style={{ borderColor: "#1E2D4A", margin: "0 auto", maxWidth: "80%", borderTop: "1px solid" }} />

      {/* Contact */}
      <section id="contact" className="py-20 px-6 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to Build?</h2>
        <p className="text-slate-400 mb-2 text-sm max-w-md mx-auto">
          Tell us about your project. Our AI instantly classifies your inquiry and routes it to the right specialist. Response within 4 hours.
        </p>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#00D4FF" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          AI-powered routing — live demo of our email triage service
        </div>
        <SmartContactForm />
      </section>

      {/* Footer */}
      <footer className="py-10 px-6" style={{ borderTop: "1px solid #1E2D4A" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs"
              style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
            >
              T
            </div>
            <span>Tioga AI</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <a href="/demos" className="hover:text-slate-400 transition-colors">Live Demos</a>
            <a href="/mcp" className="hover:text-slate-400 transition-colors">MCP</a>
            <a href="#contact" className="hover:text-slate-400 transition-colors">Contact</a>
            <a href="mailto:hello@tioga.ai" className="hover:text-slate-400 transition-colors">hello@tioga.ai</a>
          </div>
          <p>© {new Date().getFullYear()} Tioga AI</p>
        </div>
      </footer>
    </main>
  );
}
