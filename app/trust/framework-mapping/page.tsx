import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NIST AI RMF ↔ ISO 42001 Mapping",
  description:
    "How NIST AI RMF's four functions align with what ISO 42001 asks organizations to address — a conceptual map, not a certification claim.",
  openGraph: {
    title: "NIST AI RMF ↔ ISO 42001 Mapping — Tioga AI",
    description: "How a voluntary US framework and a certifiable international standard align in practice.",
  },
};

const MAPPING = [
  {
    function: "GOVERN",
    nist: "Policy, accountability, and oversight structures established before any AI system runs.",
    iso: "ISO 42001 requires a documented AI policy and clearly assigned roles and responsibilities as a foundational management-system requirement — the same starting point, expressed as a certifiable clause rather than a voluntary guideline.",
  },
  {
    function: "MAP",
    nist: "Identify context, risks, and impacts of an AI system before and during deployment.",
    iso: "ISO 42001 requires a formal AI system impact assessment process — evaluating effects on individuals, groups, and society — as a management-system control, not a one-time exercise.",
  },
  {
    function: "MEASURE",
    nist: "Track performance, cost, and quality of AI systems on an ongoing basis.",
    iso: "ISO 42001 requires organizations to define and monitor AI-system lifecycle controls across design, development, verification, deployment, and operation — including a specific documented control for AI system lifecycle management (Annex A.6.2.4, per public secondary sources on the standard).",
  },
  {
    function: "MANAGE",
    nist: "Prioritize and act on risks; allocate resources to the highest-impact controls.",
    iso: "ISO 42001 requires ongoing risk treatment and third-party/supplier management as certifiable controls — extending governance beyond systems you built in-house to AI you procured or integrated.",
  },
];

export default function FrameworkMappingPage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "#0A0F1C" }}>
      <section className="pt-36 pb-20 px-6 max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "#00D4FF15", border: "1px solid #00D4FF30", color: "#00D4FF" }}
        >
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
          Framework Mapping
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          NIST AI RMF and ISO 42001<br />
          <span style={{ color: "#00D4FF" }}>aren&apos;t competing frameworks</span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-6">
          NIST AI RMF is a voluntary US risk-management framework organized
          around four functions. ISO 42001 is an international, certifiable
          AI management system standard organized around a Plan-Do-Check-Act
          cycle with a set of Annex A controls. Different origins, same
          underlying discipline — enterprises increasingly need to satisfy
          both.
        </p>
        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mb-16">
          This is a conceptual alignment, not a claim of ISO 42001
          certification or a control-by-control audit mapping — Tioga AI is
          not yet ISO 42001 certified. It shows where the architecture behind
          our governance ledger already reflects what the standard asks for,
          and where a formal engagement would close the gap to certification.
        </p>

        <div className="space-y-4 mb-16">
          {MAPPING.map((m) => (
            <div key={m.function} className="p-6 rounded-2xl" style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}>
              <p className="text-xs font-bold tracking-wide mb-3" style={{ color: "#00D4FF" }}>{m.function}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">NIST AI RMF</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{m.nist}</p>
                </div>
                <div className="md:pl-6" style={{ borderLeft: "1px solid #1E2D4A" }}>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1.5">ISO 42001</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{m.iso}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-400 mb-4">
            Want the gap closed formally, with certification-ready documentation?
          </p>
          <a
            href="/services"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00D4FF, #0066CC)" }}
          >
            See the ISO 42001 Implementation Sprint →
          </a>
        </div>
      </section>
    </main>
  );
}
