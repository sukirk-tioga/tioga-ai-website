export default function ServicesPage() {
 const offers = [
 {
 name: "AI Operations Assessment",
 desc: "Map manual workflows across finance, HR, procurement, and operations. Rank automation opportunities by ROI and feasibility. Concrete plan in your hands.",
 price: "$10–15K",
 duration: "2–3 weeks",
 },
 {
 name: "AI Governance Readiness Assessment",
 desc: "NIST AI RMF, ISO 42001, EU AI Act, and US state law gap analysis with a prioritized remediation roadmap and sample executive summary.",
 price: "$20–35K",
 duration: "3–4 weeks",
 },
 {
 name: "ERP Modernization Advisory",
 desc: "Ongoing strategic guidance for organizations modernizing Oracle EBS, SAP legacy, or custom ERP environments — with AI integration as a first-class requirement.",
 price: "$15–25K/month",
 duration: "3–12 months",
 },
 {
 name: "AI Agent Pilot",
 desc: "Production-ready AI agent built against your highest-value workflow, integrated with your real systems, with governance documentation delivered alongside the code.",
 price: "$25–50K",
 duration: "4–8 weeks",
 },
 {
 name: "Legacy System AI Augmentation",
 desc: "Add AI capability to your existing ERP, CRM, or HRIS without replacing the underlying system — extending what works rather than ripping it out.",
 price: "$40–100K",
 duration: "8–16 weeks",
 },
 {
 name: "EU AI Act Conformity Program",
 desc: "Full conformity documentation, technical files, and governance controls for organizations subject to the EU AI Act, structured for audit readiness.",
 price: "$75–200K",
 duration: "4–8 months",
 },
 {
 name: "Multi-State AI Compliance Program",
 desc: "Gap analysis and remediation roadmap across US state AI laws for organizations operating in multiple jurisdictions.",
 price: "$40–80K",
 duration: "6–10 weeks",
 },
 {
 name: "ISO 42001 Implementation Sprint",
 desc: "Structured implementation of an AI management system aligned to ISO 42001, from readiness assessment to certification-ready documentation.",
 price: "$50–120K",
 duration: "3–6 months",
 },
 {
 name: "Agentic AI Governance Framework",
 desc: "Governance architecture for organizations deploying autonomous AI agents in production — risk registers, oversight controls, and escalation protocols.",
 price: "$30–75K",
 duration: "4–8 weeks",
 },
 {
 name: "Fractional AI Governance Officer",
 desc: "Ongoing governance leadership for organizations that need AI risk management expertise without a full-time hire — structured as a monthly retainer.",
 price: "$12–25K/month",
 duration: "6–12 months",
 },
 ];

 return (
 <main className="min-h-screen text-slate-200" style={{ background: "#0A0F1C" }}>
 <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto">
 <h1 className="text-4xl font-bold text-white mb-6">Services</h1>
 <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-16">
 Tioga AI offers ten engagements spanning AI agent development, enterprise systems modernization, and AI governance. Each is scoped to deliver a concrete, reviewable output — not a slide deck — with pricing and timelines defined up front.
 </p>
 <div className="space-y-4">
 {offers.map((offer, i) => (
 <div
 key={offer.name}
 className="p-7 rounded-2xl"
 style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.08)" }}
 >
 <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <span className="text-xs font-mono" style={{ color: "#00D4FF" }}>
 {String(i + 1).padStart(2, "0")}
 </span>
 <h2 className="text-lg font-semibold text-white">{offer.name}</h2>
 </div>
 <p className="text-sm text-slate-400 leading-relaxed">{offer.desc}</p>
 </div>
 <div className="shrink-0 text-right md:pl-8">
 <p className="text-sm font-semibold text-white">{offer.price}</p>
 <p className="text-xs text-slate-500 mt-0.5">{offer.duration}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="mt-16 text-center">
 <a
 href="#contact"
 className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
 style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
 >
 Start a conversation
 </a>
 <p className="text-xs text-slate-600 mt-4">
 Not sure where to start?{" "}
 <a href="/#services" style={{ color: "#00D4FF" }} className="hover:text-white transition-colors">
 See the three entry-point offers →
 </a>
 </p>
 </div>
 </section>
 </main>
 );
}
