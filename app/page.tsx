import SmartContactForm from "@/components/SmartContactForm";

export default function HomePage() {
  return (
    <main
      className="min-h-screen text-slate-200"
      style={{ background: "#0A0F1C" }}
    >
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(10,15,28,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1E2D4A" }}
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
      <section className="pt-32 pb-24 px-6 max-w-5xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#00D4FF" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full" />
          Enterprise AI Implementation
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
          We build AI systems
          <br />
          <span style={{ color: "#00D4FF" }}>your enterprise</span> actually uses
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          From MCP integrations to custom AI agents — Tioga AI delivers production-ready
          implementations that connect to your existing systems and deliver measurable ROI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            Start a Conversation
          </a>
          <a
            href="#services"
            className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500"
            style={{ border: "1px solid #1E2D4A", color: "#94a3b8" }}
          >
            See Our Services
          </a>
        </div>
        <p className="text-sm text-slate-600 mt-6">
          Or click the chat bubble ↘ to talk to our AI assistant right now
        </p>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">What We Build</h2>
        <p className="text-slate-400 text-center mb-12">
          Production AI systems — not prototypes — that integrate with your existing stack.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: "🤖",
              title: "Custom AI Agents",
              desc: "Bespoke AI agents that automate complex multi-step workflows, handle exceptions intelligently, and integrate with your enterprise systems.",
            },
            {
              icon: "🔗",
              title: "MCP Integrations",
              desc: "Connect Claude and other LLMs to your SAP, PeopleSoft, Salesforce, or ServiceNow environments via Model Context Protocol.",
            },
            {
              icon: "📊",
              title: "AI Strategy Consulting",
              desc: "Discovery workshops, POC development, ROI analysis, and AI roadmapping — so you invest in the right problems.",
            },
            {
              icon: "🎓",
              title: "AI Training & Enablement",
              desc: "Upskill your team on prompt engineering, AI governance, and responsible deployment practices.",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="p-6 rounded-2xl transition-all hover:border-slate-600"
              style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}
            >
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Our Process</h2>
        <p className="text-slate-400 text-center mb-12">
          From first conversation to production deployment — here&apos;s how we work.
        </p>
        <div className="space-y-4">
          {[
            { step: "01", title: "Discovery Sprint", duration: "5 days", desc: "We map your systems, identify the highest-ROI AI opportunities, and define a clear scope. You get a prototype and delivery plan." },
            { step: "02", title: "Pilot Build", duration: "2–4 weeks", desc: "We build a production-ready proof of concept integrated with your real systems. No toy demos." },
            { step: "03", title: "Deploy & Scale", duration: "Ongoing", desc: "Full deployment with monitoring, ongoing support retainers, and continuous improvement as your AI needs grow." },
          ].map((p) => (
            <div
              key={p.step}
              className="flex gap-6 p-6 rounded-2xl"
              style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}
            >
              <div className="text-2xl font-bold font-mono shrink-0" style={{ color: "#00D4FF" }}>
                {p.step}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "#00D4FF15", color: "#00D4FF", border: "1px solid #00D4FF30" }}
                  >
                    {p.duration}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Build?</h2>
        <p className="text-slate-400 mb-4">
          Tell us about your project and our AI will instantly classify your inquiry
          and route it to the right specialist.
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
      <footer
        className="py-8 px-6 text-center text-sm text-slate-600"
        style={{ borderTop: "1px solid #1E2D4A" }}
      >
        <p>© {new Date().getFullYear()} Tioga AI · hello@tioga.ai</p>
      </footer>
    </main>
  );
}
