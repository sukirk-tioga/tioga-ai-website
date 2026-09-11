import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timecard Exception Agent, Shadow-Mode Demo — Tioga AI",
  description:
    "An agent reviews synthetic timecard exceptions — missed punches, late punches, unapproved overtime, PTO requests — and proposes a correction or approval for each, citing the named payroll-cycle control and FLSA/state wage-and-hour rule behind it. Shadow-mode only: it never auto-executes. See the measured human-agreement rate over a defined review window. 100% synthetic data.",
  alternates: { canonical: "/demos/timecard-exception-shadow-mode" },
  openGraph: {
    title: "Timecard Exception Agent, Shadow-Mode Demo — Tioga AI",
    description:
      "Propose, don't auto-act: a timecard exception agent cites its authorization basis and the statutory rule it checked for every proposal, then shows how often a human reviewer agreed with it over a defined shadow-mode window.",
  },
};

export default function TimecardExceptionShadowModeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
