import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Integrations",
  description:
    "See how Claude connects to enterprise systems like SAP, Salesforce, and ServiceNow via the Model Context Protocol — live, interactive demo.",
  openGraph: {
    title: "MCP Integrations — Tioga AI",
    description:
      "How Claude connects to SAP, Salesforce, and ServiceNow via the Model Context Protocol.",
  },
};

export default function McpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
