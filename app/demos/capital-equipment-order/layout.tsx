import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Governed Capital Equipment Order Booking Demo — Tioga AI",
  description:
    "Book a sales order against a placeholder material before the final product configuration is known — watch a deterministic policy auto-execute, escalate, or block, with an independent ERP-layer check that catches what policy alone can't.",
  alternates: { canonical: "/demos/capital-equipment-order" },
  openGraph: {
    title: "Governed Capital Equipment Order Booking Demo — Tioga AI",
    description:
      "A live, governed write-path demo grounded in a real SAP fit-gap pattern: sequencing a sales order before the product exists.",
  },
};

export default function CapitalEquipmentOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
