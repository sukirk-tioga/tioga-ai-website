import type { CSSProperties } from "react";
import "./solutions-hub.css";
import ExploreCTA from "./ExploreCTA";

type Workflow = { id: string; name: string; status: "live" | "not-built" };
type Family = { id: string; shortName: string; name: string; purpose: string; workflows: Workflow[] };

/** Inventory transcribed from the supplied design review. "Live" is a
 * source label, not an independently verified claim about production
 * deployment. */
export const families: Family[] = [
  { id: "finance", shortName: "Finance", name: "Finance & Purchasing Operations", purpose: "AP exception handling, invoice governance, order and quotation operations.", workflows: [
    { id: "ap-exceptions", name: "AP exceptions & invoice governance", status: "live" },
    { id: "sales-orders", name: "Sales & order operations", status: "live" },
  ] },
  { id: "service", shortName: "Service", name: "Service & Operational Workflows", purpose: "Field service decisions and email/document triage. HR & procurement workflows are not yet built.", workflows: [
    { id: "field-service", name: "Field service & operations", status: "live" },
    { id: "hr-procurement", name: "HR & procurement workflows", status: "not-built" },
  ] },
  { id: "reporting", shortName: "Reporting", name: "Reporting & Business Information", purpose: "Querying and extracting from composite ERP-style data; not general database connectivity.", workflows: [
    { id: "erp-reporting", name: "ERP reporting & document extraction", status: "live" },
  ] },
  { id: "integration", shortName: "Integration", name: "Systems Integration & Modernization", purpose: "Oracle EBS, SAP, governed write-paths, MCP-based agent connections, and migration assessment.", workflows: [
    { id: "oracle-sap", name: "Oracle EBS & SAP (by system)", status: "live" },
    { id: "write-paths", name: "Governed write-paths", status: "live" },
    { id: "mcp", name: "Connecting agents safely (MCP)", status: "live" },
    { id: "salesforce", name: "Salesforce solution & demo", status: "not-built" },
  ] },
  { id: "governance", shortName: "Governance", name: "AI Oversight & Governance", purpose: "Explore the four governance workflows.", workflows: [
    { id: "ledger", name: "Governance Ledger", status: "live" },
    { id: "watch", name: "Standing Watch", status: "live" },
    { id: "oversight", name: "Automation Oversight", status: "live" },
    { id: "autonomy", name: "Agent Autonomy Mapper", status: "live" },
  ] },
];

function countLabel(family: Family) {
  const live = family.workflows.filter(w => w.status === "live").length;
  const unbuilt = family.workflows.length - live;
  return `${live} live${unbuilt ? ` · ${unbuilt} not built` : ""}`;
}

/** Only relative site paths or HTTPS destinations are accepted; anything
 * else (including undefined) renders as plain, non-linked text. */
function safeHref(candidate: string | undefined): string | undefined {
  return candidate && (/^\/(?!\/)/.test(candidate) || /^https:\/\//.test(candidate)) ? candidate : undefined;
}

type Props = {
  variant?: "editorial" | "catalog";
  /** Unique per instance if multiple hubs appear on the same page. */
  id?: string;
  /** Actual verified detail-page URLs keyed by workflow ID. Missing URLs
   * render as plain text, never broken placeholder links. */
  links?: Record<string, string>;
  /** Actual verified overview-page URLs keyed by family ID, for the rare
   * case where a real page covers the whole family rather than one
   * specific workflow (e.g. a general governance-programs page alongside
   * named tools like the Governance Ledger). Missing URLs render nothing,
   * same honesty rule as `links`. */
  familyLinks?: Record<string, string>;
  theme?: "light" | "dark";
  style?: CSSProperties;
};

function WorkflowRows({ family, links }: { family: Family; links: Record<string, string> }) {
  return <ul className="sh-rows">{family.workflows.map(w => {
    const href = safeHref(links[w.id]);
    return <li className="sh-row" key={w.id}>
      {href ? <a href={href}>{w.name} <span aria-hidden="true">↗</span></a> : <span>{w.name}</span>}
      <span className={`sh-status${w.status === "live" ? " sh-status-live" : ""}`}>{w.status === "live" ? "Live" : "Not built"}</span>
    </li>;
  })}</ul>;
}

function FamilyLink({ family, familyLinks }: { family: Family; familyLinks: Record<string, string> }) {
  const href = safeHref(familyLinks[family.id]);
  if (!href) return null;
  return <a className="sh-family-link" href={href}>See {family.shortName.toLowerCase()} programs <span aria-hidden="true">↗</span></a>;
}

export default function SolutionsHub({ variant = "editorial", id = "solutions", links = {}, familyLinks = {}, theme, style }: Props) {
  const governance = families.find(f => f.id === "governance")!;
  const others = families.filter(f => f.id !== "governance");
  const totalLive = families.flatMap(f => f.workflows).filter(w => w.status === "live").length;
  return <section className="sh" data-variant={variant} data-theme={theme} style={style} aria-labelledby={`${id}-title`}>
    <div className="sh-wrap">
      <p className="sh-eyebrow">Solutions</p>
      {variant === "editorial" ? <>
        <div className="sh-hero">
          <div><h1 id={`${id}-title`}>Find the right workflow for your business.</h1>
            <p className="sh-intro">Start with the problem. Explore workflows across your operations, systems, and AI oversight.</p>
            <div className="sh-actions"><ExploreCTA targetId={`${id}-index`} label={`Explore ${totalLive} live workflows`} /><a className="sh-secondary" href={`#${id}-scope`}>See current scope</a></div>
          </div>
          <aside className="sh-process" aria-label="Illustrative workflow, not evidence of an implementation">
            <p>Illustrative workflow</p><ol className="sh-flow"><li><span>01</span>Business input</li><li><span>02</span>Review & control</li><li><span>03</span>Recorded action</li></ol>
          </aside>
        </div>
        <div id={`${id}-index`} className="sh-index">
          <section className="sh-feature" id={`${id}-governance`} aria-labelledby={`${id}-gov-title`}>
            <div className="sh-feature-top"><div><p className="sh-eyebrow">Focus area</p><h2 id={`${id}-gov-title`}>{governance.name}</h2><p className="sh-purpose">{governance.purpose}</p></div><span className="sh-status sh-status-live">{countLabel(governance)}</span></div>
            <details><summary>Explore governance</summary><WorkflowRows family={governance} links={links}/></details>
            <FamilyLink family={governance} familyLinks={familyLinks} />
          </section>
          <div className="sh-index-title"><h2>Explore by business problem</h2><p>4 more solution families</p></div>
          <div className="sh-family-grid">{others.map(f => <section className="sh-family" key={f.id} id={`${id}-${f.id}`} aria-labelledby={`${id}-${f.id}-title`}>
            <div className="sh-family-head"><h3 id={`${id}-${f.id}-title`}>{f.name}</h3><span className="sh-meta">{countLabel(f)}</span></div>
            <p className="sh-purpose">{f.purpose}</p><details><summary>Explore {f.shortName.toLowerCase()}</summary><WorkflowRows family={f} links={links}/></details>
            <FamilyLink family={f} familyLinks={familyLinks} />
          </section>)}</div>
        </div>
      </> : <>
        <h1 id={`${id}-title`}>Choose a business problem.</h1>
        <p className="sh-intro">{totalLive} live workflows across five families. Current gaps are shown alongside them.</p>
        <div className="sh-catalog-layout">
          <nav className="sh-family-nav" aria-label="Solution families">{families.map(f => <a key={f.id} href={`#${id}-${f.id}`}>{f.shortName}</a>)}</nav>
          <div id={`${id}-index`}>{families.map(f => <section className="sh-family" key={f.id} id={`${id}-${f.id}`} aria-labelledby={`${id}-${f.id}-title`}>
            <div className="sh-family-head"><h3 id={`${id}-${f.id}-title`}>{f.name}</h3><span className="sh-meta">{countLabel(f)}</span></div>
            <p className="sh-purpose">{f.purpose}</p><WorkflowRows family={f} links={links}/>
            <FamilyLink family={f} familyLinks={familyLinks} />
          </section>)}</div>
        </div>
      </>}
      <section className="sh-scope" id={`${id}-scope`} aria-labelledby={`${id}-scope-title`}>
        <h2 id={`${id}-scope-title`}>Current scope</h2>
        <p>HR & procurement workflows and the Salesforce solution & demo are not yet built. ERP reporting covers composite ERP-style data; it does not provide general database connectivity.</p>
      </section>
    </div>
  </section>;
}
