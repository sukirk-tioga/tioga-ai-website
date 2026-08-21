import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SAP Joule Capability Gate Map — Tioga AI",
  description:
    "SAP says 200+ agents automate your business. See what's actually documented to write versus view-and-hand-off, and one real worked example of the gates a capability sits behind — straight from SAP's own Joule Capabilities Guide.",
  alternates: { canonical: "/demos/joule-capability-gate-map" },
  openGraph: {
    title: "SAP Joule Capability Gate Map — Tioga AI",
    description:
      "The gap between SAP's 200+ agent count and what's documented to write, plus one real worked example of how a Joule capability is gated.",
  },
};

export default function JouleCapabilityGateMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
