import type { Metadata } from "next";
import ShowcaseCanvasLoader from "./ShowcaseCanvasLoader";

// Phase 0 de-risk spike only — see
// ~/SecondBrain/TiogaAI/projects/3d-website-showcase-plan-2026-08-11.md.
// This is a trivial placeholder to prove the R3F v8 + drei install resolves
// cleanly and doesn't bloat existing routes. Not the real scene. noindex
// until Phase 2 sign-off (plan §1, §5).
// title is a short string, not the full "— Tioga AI" suffix: /showcase is a
// direct child of the root layout (no intermediate app/showcase/layout.tsx),
// so root layout.tsx's title.template ("%s — Tioga AI") applies here — same
// convention as other root-level pages (/about, /services). openGraph.title
// isn't templated, so it spells out the full string, also matching convention.
export const metadata: Metadata = {
  title: "The Oversight Plane",
  description:
    "Phase 0 placeholder for an interactive 3D showcase of Tioga AI's governance ledger. Not yet approved for public indexing.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/showcase" },
  openGraph: {
    title: "The Oversight Plane — Tioga AI",
    description:
      "Phase 0 placeholder for an interactive 3D showcase of Tioga AI's governance ledger. Not yet approved for public indexing.",
  },
};

export default function ShowcasePage() {
  return (
    <main className="min-h-screen text-slate-200" style={{ background: "var(--bg-dark)" }}>
      <div className="pt-28 pb-20 px-6 max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance text-white mb-3">
            The Oversight Plane
          </h1>
          <p className="text-xl text-slate-400 max-w-xl">
            Phase 0 spike — a placeholder scene proving the stack installs cleanly. Not the real
            build yet.
          </p>
        </div>

        <ShowcaseCanvasLoader />
      </div>
    </main>
  );
}
