import Link from "next/link";
import SmartContactForm from "@/components/SmartContactForm";
import TrackedCTA from "@/components/TrackedCTA";
import HeroDemo from "@/components/HeroDemo";
import GovernanceLedgerPreview from "@/components/GovernanceLedgerPreview";

const CAL_LINK = "https://cal.com/sukir-kumaresan-rfgb7k/introduction-chat";

export default function HomePage() {
 return (
 <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>

 {/* Hero */}
 <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center relative overflow-hidden">
 <div
 className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 pointer-events-none"
 style={{ background: "radial-gradient(ellipse, var(--accent), transparent 70%)", filter: "blur(60px)" }}
 />
 <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight text-balance">
 AI agents for the{" "}
 <span style={{ color: "var(--accent)" }}>ERP</span>{" "}
 you already have.
 </h1>
 <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-3 leading-relaxed">
 Governed agents for finance, procurement and operations on Oracle EBS and SAP — running inside your identity, approvals and audit trail, every action visible before it executes. No migration required.
 </p>
 <p className="text-sm text-slate-400 max-w-xl mx-auto mb-10">
 Five-day discovery sprint, $5,000 flat — credited toward your project if you move forward.
 </p>
 <div className="flex flex-col items-center sm:flex-row gap-4 justify-center">
 <TrackedCTA
 href={CAL_LINK}
 target="_blank"
 rel="noopener noreferrer"
 event="cta_book_call"
 data={{ location: "hero" }}
 className="px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
 style={{ background: "var(--accent-dark)" }}
 >
 Book a 20-minute fit call
 </TrackedCTA>
 <TrackedCTA
 href="/demos/ap-exception-workflow"
 event="cta_view_demo"
 data={{ location: "hero" }}
 className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-white"
 style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
 >
 See an AP agent run
 </TrackedCTA>
 </div>
 <HeroDemo />
 </section>

 {/* Stats Bar */}
 <section className="px-6 pb-8 max-w-5xl mx-auto">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ background: "var(--border)" }}>
 {[
 { value: "5 days", label: "Discovery sprint + prototype" },
 { value: "Oracle + SAP", label: "Enterprise-system specialization" },
 { value: "Controls", label: "Identity, approvals, audit trail" },
 { value: "2–8 wks", label: "Pilot timeline, scope-dependent" },
 ].map((stat) => (
 <div key={stat.label} className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
 <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>{stat.value}</div>
 <div className="text-xs text-slate-400 uppercase tracking-wide">{stat.label}</div>
 </div>
 ))}
 </div>
 </section>

 {/* Frameworks strip — still intentionally secondary to the systems-led hero
 (per the 2026-08-04 positioning decision), just legible now: was
 rendered smaller and dimmer than any other element on the page,
 which read as an oversight rather than a deliberate design choice. */}
 <section className="px-6 pb-16 max-w-5xl mx-auto">
 <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
 <span style={{ color: "var(--text-muted-2)" }}>Governed to:</span>
 {["NIST AI RMF", "ISO 42001", "EU AI Act"].map((std) => (
 <span
 key={std}
 className="px-3 py-1 rounded-full font-medium"
 style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
 >
 {std}
 </span>
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
 Enterprise AI projects stall because generic consultants build demos that can&apos;t connect to real systems. Your ERP, CRM and HRIS are locked behind custom APIs, legacy auth and security layers that require deep enterprise expertise to navigate.
 </p>
 </div>
 <div className="hidden md:block w-px self-stretch" style={{ background: "var(--border)" }} />
 <div className="flex-1">
 <h3 className="text-lg font-semibold text-white mb-2">The Tioga difference</h3>
 <p className="text-sm text-slate-400 leading-relaxed">
 I build MCP-native AI systems that speak your enterprise stack&apos;s language from day one. Your pilot runs on your real data, in your real environment — so the path to production is already built by the time I present results.
 </p>
 </div>
 </div>
 </section>

 {/* Try It Live */}
 <section className="py-4 px-6 max-w-5xl mx-auto">
 <div className="text-center mb-8">
 <p
 className="text-lg italic max-w-xl mx-auto mb-2 leading-relaxed"
 style={{ color: "var(--text)", borderLeft: "2px solid var(--accent)", paddingLeft: "1rem" }}
 >
 &ldquo;I don&apos;t have client logos to show you yet — as a new practice, that&apos;s the truth. Try the product instead.&rdquo;
 </p>
 <TrackedCTA
 href="/samples/erp-agent-readiness-checklist.html"
 target="_blank"
 rel="noopener noreferrer"
 event="lead_asset_download"
 data={{ asset: "erp-agent-readiness-checklist", location: "mid_page" }}
 className="text-xs underline underline-offset-2 transition-colors hover:text-white inline-block mb-6"
 style={{ color: "var(--accent)" }}
 >
 Not ready to try the demos? Free ERP Agent-Readiness Checklist →
 </TrackedCTA>
 <div
 className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
 style={{ background: "#00D4FF10", border: "1px solid #00D4FF25", color: "var(--accent)" }}
 >
 <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
 Live in our environment — demo data
 </div>
 <h2 className="text-3xl font-bold text-white mb-3">Try It Right Now</h2>
 <p className="text-slate-400 max-w-lg mx-auto text-sm">Four real AI workflows. No signup. No mockups. The same Claude models built into every Tioga AI engagement.</p>
 </div>
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 {
 icon: "📄",
 title: "Invoice Processing",
 desc: "Upload a PDF. Get structured vendor, amount and line-item data in under 5 seconds.",
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
 icon: (
 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
 <ellipse cx="7" cy="6" rx="4" ry="2" />
 <path d="M3 6v6c0 1.1 1.8 2 4 2s4-.9 4-2V6" />
 <path strokeLinecap="round" d="M13.5 12H18m0 0l-2.5-2.5M18 12l-2.5 2.5" />
 <ellipse cx="17" cy="16" rx="4" ry="2" />
 </svg>
 ),
 title: "Migration Assessment",
 desc: "Get a sample EBS → SAP migration readiness assessment in 60 seconds.",
 tag: "Oracle EBS → S/4HANA",
 href: "/demos/migration-assessment"
 },
 {
 icon: "🛡️",
 title: "Standing Watch",
 desc: "Real, dated findings from Tioga's own governance automations — what got auto-fixed, and what it correctly left for a human.",
 tag: "AI Governance",
 href: "/demos/standing-watch"
 },
 ].map((demo) => (
 <Link
 key={demo.title}
 href={demo.href}
 className="group p-6 rounded-2xl transition-all hover:border-slate-500 cursor-pointer block"
 style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
 >
 <div className="flex items-start justify-between mb-4">
 <span className="text-3xl">{demo.icon}</span>
 <span
 className="text-xs px-2 py-0.5 rounded-full"
 style={{ background: "#00D4FF10", color: "var(--accent)", border: "1px solid #00D4FF25" }}
 >
 {demo.tag}
 </span>
 </div>
 <h3 className="text-base font-semibold text-white mb-2">{demo.title}</h3>
 <p className="text-xs text-slate-400 leading-relaxed mb-4">{demo.desc}</p>
 <span className="text-sm font-medium inline-flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
 Try it live →
 </span>
 </Link>
 ))}
 </div>
 </section>

 {/* Governance Ledger Callout */}
 <section className="pt-2 pb-4 px-6 max-w-5xl mx-auto">
 <div
 className="rounded-2xl p-6 md:p-8"
 style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
 >
 <div className="grid md:grid-cols-2 gap-6 items-center">
 <div>
 <h3 className="text-base font-semibold text-white mb-1">See how I govern my own AI</h3>
 <p className="text-xs leading-relaxed max-w-md mb-4" style={{ color: "var(--text-muted)" }}>
 The Governance Ledger is real operational data from Tioga&apos;s own AI routing gateway, mapped to NIST AI RMF — not a mockup. Every call logged, costed, and attributed as a byproduct of routing, not bolted on.
 </p>
 <Link
 href="/demos/governance-ledger"
 className="text-sm font-medium transition-colors hover:text-white inline-flex items-center gap-1.5"
 style={{ color: "var(--accent)" }}
 >
 View the full ledger →
 </Link>
 </div>
 <GovernanceLedgerPreview />
 </div>
 </div>
 </section>

 {/* Integrations */}
 <section className="py-16 px-6 max-w-5xl mx-auto">
 <p className="text-center text-xs text-slate-400 uppercase tracking-widest mb-8">I integrate with your existing enterprise stack</p>
 <div className="flex flex-wrap justify-center items-center gap-3">
 {["SAP", "Salesforce", "ServiceNow", "Oracle", "Workday", "SharePoint", "Slack", "Microsoft 365"].map((name) => (
 <div
 key={name}
 className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
 style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
 >
 {name}
 </div>
 ))}
 </div>
 </section>

 <div style={{ borderColor: "var(--border)", margin: "0 auto", maxWidth: "80%", borderTop: "1px solid" }} />

 {/* Services */}
 <section id="services" className="py-20 px-6 max-w-5xl mx-auto">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-bold text-white mb-3">Where to start</h2>
 <p className="text-slate-400 text-sm max-w-lg mx-auto">
 Three entry-point offers — each delivers a concrete, reviewable output in weeks, not quarters.
 </p>
 <p className="text-xs max-w-lg mx-auto mt-2" style={{ color: "var(--text-muted-3)" }}>
 Pricing published up front, not gated behind a sales call. The $5,000 discovery sprint is credited toward whichever offer you move forward with.
 </p>
 </div>
 <div
 className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl mb-6"
 style={{ background: "linear-gradient(135deg, #00D4FF10, #0066CC10)", border: "1px solid #00D4FF25" }}
 >
 <div>
 <p className="text-white font-semibold mb-1">Not sure where to start?</p>
 <p className="text-sm" style={{ color: "var(--text-muted)" }}>
 Five-day Discovery Sprint, $5,000 flat — credited in full toward whichever offer below you move forward with.
 </p>
 </div>
 <TrackedCTA
 href={CAL_LINK}
 target="_blank"
 rel="noopener noreferrer"
 event="cta_book_call"
 data={{ location: "services_sprint_banner" }}
 className="shrink-0 px-6 py-3 rounded-xl text-white font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90"
 style={{ background: "var(--accent-dark)" }}
 >
 Book the sprint
 </TrackedCTA>
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {[
 {
 name: "AI Operations Assessment",
 valueProp: "Find the workflows AI can take off your plate",
 desc: "2–3 weeks. Map manual workflows across finance, HR, procurement, and operations. Rank automation opportunities by ROI and feasibility. Concrete plan in your hands.",
 investment: "$10–15K",
 ctaLabel: "Scope an assessment",
 recommended: true,
 },
 {
 name: "AI Governance Readiness Assessment",
 valueProp: "Get audit-ready before regulators or customers ask",
 desc: "3–4 weeks. NIST AI RMF, ISO 42001, EU AI Act, and US state law gap analysis with a prioritized remediation roadmap. Sample executive summary included.",
 investment: "$20–35K",
 ctaLabel: "Check my readiness",
 recommended: false,
 },
 {
 name: "AI Agent Pilot",
 valueProp: "Build one working agent against your highest-value workflow",
 desc: "4–8 weeks. Production-ready agent. Governance built in from day one. Working pilot you can extend or hand off.",
 investment: "$25–50K",
 ctaLabel: "Plan a pilot",
 recommended: false,
 },
 ].map((offer) => (
 <div
 key={offer.name}
 className="flex flex-col rounded-2xl overflow-hidden"
 style={{
 background: "var(--bg-card)",
 border: offer.recommended ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.08)",
 }}
 >
 <div className="h-px w-full" style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-dark))" }} />
 <div className="flex flex-col flex-1 p-8">
 {offer.recommended && (
 <span
 className="inline-block self-start mb-4 px-3 py-1 rounded-full text-xs font-semibold"
 style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
 >
 Start here
 </span>
 )}
 <h3 className="text-2xl font-semibold text-white mb-3 leading-snug">{offer.name}</h3>
 <p className="text-lg font-medium text-slate-400 mb-5 leading-snug">{offer.valueProp}</p>
 <p className="text-base leading-relaxed flex-1 mb-8" style={{ color: "var(--text-body)" }}>{offer.desc}</p>
 <div className="space-y-4">
 <p className="text-2xl font-semibold text-white">{offer.investment}</p>
 <a
 href="#contact"
 className="block text-center w-full px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
 style={{ background: "var(--accent-dark)" }}
 >
 {offer.ctaLabel}
 </a>
 </div>
 </div>
 </div>
 ))}
 </div>
 <p className="text-center mt-10 text-sm leading-relaxed" style={{ color: "var(--text-faint)" }}>
 Plus ten more engagements across two practices — modernizing ERP with an agent layer, and governing enterprise AI end to end.{" "}
 <Link href="/services" className="underline underline-offset-2 transition-colors hover:text-white" style={{ color: "var(--accent)" }}>
 See all services →
 </Link>
 </p>
 <p className="text-center mt-4 text-sm leading-relaxed" style={{ color: "var(--text-muted-2)" }}>
 See what you actually get:{" "}
 <a href="/samples/discovery-sprint-scope.html" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-white" style={{ color: "var(--accent)" }}>
 sample discovery sprint scope
 </a>
 ,{" "}
 <a href="/samples/governance-evidence-excerpt.html" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-white" style={{ color: "var(--accent)" }}>
 sample governance evidence excerpt
 </a>
 , or{" "}
 <a href="/samples/ai-governance-executive-summary.html" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-white" style={{ color: "var(--accent)" }}>
 sample readiness assessment summary
 </a>
 .
 </p>
 </section>

 {/* Why Tioga */}
 <section className="px-6 pb-20 max-w-5xl mx-auto">
 <div className="rounded-2xl p-8 md:p-10" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
 <div className="text-center mb-10">
 <h2 className="text-3xl font-bold text-white mb-3">What working with Tioga AI looks like</h2>
 <p className="text-slate-400 text-sm max-w-lg mx-auto">Not a generic AI consultancy. One founder who specializes in one thing: getting AI into production inside complex enterprise environments.</p>
 </div>
 <div className="mb-10 pb-8 text-center" style={{ borderBottom: "1px solid var(--border)" }}>
 <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-body)" }}>
 Tioga AI is built by <span className="text-white font-medium">Sukir Kumaresan</span>, who spent decades on the operating side of enterprise systems — Oracle EBS, SAP, finance, HR, procurement — and the governance work that keeps those systems audit-ready. Every demo on this site, including the Governance Ledger above, is code Sukir wrote and infrastructure Sukir runs. No outsourced build, no slide deck.
 </p>
 </div>
 <div className="grid md:grid-cols-3 gap-6">
 {[
 { icon: "⚡", title: "Speed to value", desc: "My 5-day discovery sprint gives you a working prototype and a delivery plan before most firms finish scoping." },
 { icon: "🔐", title: "Enterprise-grade security", desc: "Security controls — role-based access, audit logging, and architecture aligned to SOC 2 Trust Services Criteria — so your systems of record stay under your control. No independent SOC 2 report exists yet." },
 { icon: "🎯", title: "Integration-first approach", desc: "I build for your stack from day one. No rip-and-replace. Your existing systems become more powerful." },
 { icon: "🧪", title: "No toy demos", desc: "Every pilot runs against your real data and real systems, built to carry into production, not thrown away after the demo." },
 { icon: "📐", title: "MCP-native builds", desc: "I specialize in Model Context Protocol — the emerging standard for connecting AI to enterprise systems at scale." },
 { icon: "📈", title: "Measurable ROI", desc: "I define success metrics up front. You see ROI calculations in the pilot, not after a 6-month engagement." },
 ].map((item) => (
 <div key={item.title} className="flex gap-3">
 <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
 <div>
 <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
 <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>

 <div style={{ borderColor: "var(--border)", margin: "0 auto", maxWidth: "80%", borderTop: "1px solid" }} />

 {/* Process */}
 <section id="process" className="py-20 px-6 max-w-4xl mx-auto">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-bold text-white mb-3">My Process</h2>
 <p className="text-slate-400 text-sm">From first conversation to production deployment — with no ambiguity about what happens next.</p>
 </div>
 <div className="space-y-4">
 {[
 {
 step: "01", title: "Discovery Sprint", duration: "5 days · $5,000 flat",
 desc: "I map your systems, identify the highest-ROI AI opportunities and define a clear scope with your team. You get a working prototype and a detailed delivery plan — before any large commitment.",
 detail: "System audit · Use-case prioritization · Prototype · Delivery plan"
 },
 {
 step: "02", title: "Pilot Build", duration: "2–8 weeks · scope-dependent",
 desc: "I build a production-ready proof of concept integrated with your real systems. No toy demos — this runs against live data and real integrations. You see exactly what the full system will do.",
 detail: "Full integration · Real data · Stakeholder review · Go/no-go decision"
 },
 {
 step: "03", title: "Deploy & Scale", duration: "Ongoing",
 desc: "Full production deployment with monitoring, SLAs, ongoing support retainers and continuous improvement as your AI needs grow. I stay a partner, not a vendor.",
 detail: "Production deploy · Monitoring · Support SLA · Continuous improvement"
 },
 ].map((p) => (
 <div key={p.step} className="flex gap-6 p-7 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
 <div className="text-2xl font-bold font-mono shrink-0 mt-0.5" style={{ color: "var(--accent)" }}>{p.step}</div>
 <div className="flex-1">
 <div className="flex flex-wrap items-center gap-3 mb-2">
 <h3 className="font-semibold text-white">{p.title}</h3>
 <span
 className="text-xs px-2 py-0.5 rounded-full"
 style={{ background: "#00D4FF15", color: "var(--accent)", border: "1px solid #00D4FF30" }}
 >
 {p.duration}
 </span>
 </div>
 <p className="text-sm text-slate-400 leading-relaxed mb-2">{p.desc}</p>
 <p className="text-xs text-slate-400">{p.detail}</p>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* MCP Callout */}
 <section className="px-6 pb-20 max-w-5xl mx-auto">
 <Link
 href="/mcp"
 className="block rounded-2xl p-8 transition-all hover:border-slate-500 group"
 style={{ background: "linear-gradient(135deg, #00D4FF08, #0066CC12)", border: "1px solid #00D4FF25" }}
 >
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div>
 <div
 className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
 style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
 >
 New Standard
 </div>
 <h3 className="text-xl font-bold text-white mb-2">Model Context Protocol (MCP)</h3>
 <p className="text-sm text-slate-400 max-w-lg">
 MCP is how frontier AI connects to enterprise systems. Tioga AI is built MCP-native from day one, with working connectors for SAP and Salesforce you can try on the MCP page. See the architecture, explore live demos and understand why your next AI project should be MCP-native.
 </p>
 </div>
 <div
 className="shrink-0 px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all group-hover:opacity-90"
 style={{ background: "var(--accent-dark)", color: "white" }}
 >
 Explore MCP →
 </div>
 </div>
 </Link>
 </section>

 <div style={{ borderColor: "var(--border)", margin: "0 auto", maxWidth: "80%", borderTop: "1px solid" }} />

 {/* Contact */}
 <section id="contact" className="py-20 px-6 max-w-2xl mx-auto text-center">
 <h2 className="text-3xl font-bold text-white mb-3">Ready to Build?</h2>
 <p className="text-slate-400 mb-2 text-sm max-w-md mx-auto">
 Tell me about your project. My AI instantly classifies your inquiry so it reaches me with the right context. Response within one business day — or email{" "}
 <a href="mailto:hello@tioga.ai" className="underline hover:text-white transition-colors">hello@tioga.ai</a> directly.
 </p>
 <p className="text-sm mb-6">
 <TrackedCTA
 href={CAL_LINK}
 target="_blank"
 rel="noopener noreferrer"
 event="cta_book_call"
 data={{ location: "contact_section" }}
 className="underline hover:text-white transition-colors"
 style={{ color: "var(--accent)" }}
 >
 Or skip the form and book a 20-minute call directly →
 </TrackedCTA>
 </p>
 <div
 className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
 style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "var(--accent)" }}
 >
 <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
 AI-powered routing — live demo of our email triage service
 </div>
 <SmartContactForm />
 </section>
 </main>
 );
}
