import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NIST AI RMF ↔ ISO 42001 ↔ EU AI Act Mapping",
  description:
    "How NIST AI RMF's four functions, ISO 42001's management-system controls, and the EU AI Act's legal obligations line up — a conceptual map, not a certification or legal-compliance claim.",
  alternates: { canonical: "/trust/framework-mapping" },
  openGraph: {
    title: "NIST AI RMF ↔ ISO 42001 ↔ EU AI Act Mapping — Tioga AI",
    description: "How a voluntary framework, a certifiable standard, and a binding regulation line up in practice.",
  },
};

const MAPPING = [
  {
    function: "GOVERN",
    nist: "Policy, accountability, and oversight structures established before any AI system runs.",
    iso: "ISO 42001 requires a documented AI policy and clearly assigned roles and responsibilities as a foundational management-system requirement — the same starting point, expressed as a certifiable clause rather than a voluntary guideline.",
    euAiAct: "For high-risk systems, the Act requires a quality management system and named responsibility for conformity before deployment — governance stops being optional and becomes a legal precondition to placing the system on the market.",
  },
  {
    function: "MAP",
    nist: "Identify context, risks, and impacts of an AI system before and during deployment.",
    iso: "ISO 42001 requires a formal AI system impact assessment process — evaluating effects on individuals, groups, and society — as a management-system control, not a one-time exercise.",
    euAiAct: "The Act requires classifying a system into a risk tier (prohibited, high-risk, limited-risk, or minimal) before deployment — the classification itself determines which legal obligations apply, not just an internal risk rating.",
  },
  {
    function: "MEASURE",
    nist: "Track performance, cost, and quality of AI systems on an ongoing basis.",
    iso: "ISO 42001 requires organizations to define and monitor AI-system lifecycle controls across design, development, verification, deployment, and operation — including a specific documented control for AI system lifecycle management (Annex A.6.2.4, per public secondary sources on the standard).",
    euAiAct: "High-risk systems require technical documentation and conformity assessment evidence maintained across the system's lifecycle — measurement that has to be producible on demand for a regulator, not just for an internal audit.",
  },
  {
    function: "MANAGE",
    nist: "Prioritize and act on risks; allocate resources to the highest-impact controls.",
    iso: "ISO 42001 requires ongoing risk treatment and third-party/supplier management as certifiable controls — extending governance beyond systems you built in-house to AI you procured or integrated.",
    euAiAct: "High-risk systems require a documented human oversight mechanism as a legal requirement, not a best practice — someone with the authority and information to intervene, not just a dashboard someone might check.",
  },
];

export default function FrameworkMappingPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-dark)", color: "var(--text)" }}>
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#C8340615", border: "1px solid #C8340630", color: "var(--accent)" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Framework Mapping
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: "var(--text)" }}>
          NIST, ISO 42001, and the EU AI Act<br />
          <span style={{ color: "var(--accent)" }}>aren&apos;t three separate homeworks</span>
        </h1>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mb-6">
          NIST AI RMF is a voluntary US risk-management framework organized
          around four functions. ISO 42001 is an international, certifiable
          AI management system standard built on the same functions,
          expressed as auditable controls. The EU AI Act is neither
          voluntary nor a framework — it&apos;s binding law for organizations
          with EU exposure, and its obligations for high-risk systems land on
          the same four functions from the other direction: as legal
          requirements rather than best practices.
        </p>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl mb-16">
          This is a conceptual alignment, not a claim of ISO 42001
          certification, a control-by-control audit mapping, or legal advice
          — Tioga AI is not yet ISO 42001 certified, and the EU AI Act
          obligations shown below apply only to systems that fall into the
          Act&apos;s high-risk tier. It shows where the architecture behind our
          governance ledger already reflects what these three demand, and
          where a formal engagement would close the remaining gap.
        </p>

        <div className="space-y-4 mb-16">
          {MAPPING.map((m) => (
            <div key={m.function} className="p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold tracking-wide mb-3" style={{ color: "var(--accent)" }}>{m.function}</p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] mb-1.5">NIST AI RMF</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{m.nist}</p>
                </div>
                <div className="md:pl-6" style={{ borderLeft: "1px solid var(--border)" }}>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] mb-1.5">ISO 42001</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{m.iso}</p>
                </div>
                <div className="md:pl-6" style={{ borderLeft: "1px solid var(--border)" }}>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] mb-1.5">EU AI Act</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{m.euAiAct}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center sm:flex-row gap-4 justify-center text-center">
          <a
            href="/services"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            See the ISO 42001 Implementation Sprint →
          </a>
          <a
            href="/trust/eu-ai-act/calculator"
            className="inline-block px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-[var(--text)]"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            Check your EU AI Act risk tier →
          </a>
        </div>
      </section>
    </main>
  );
}
