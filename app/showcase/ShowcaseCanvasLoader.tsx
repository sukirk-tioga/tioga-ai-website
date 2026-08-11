"use client";

import dynamic from "next/dynamic";

// ssr: false must be called from a client component in the App Router —
// this loader exists solely to isolate that call from the server-component
// page.tsx (which carries the route metadata).
const ShowcaseScene = dynamic(() => import("./ShowcaseScene"), { ssr: false });

export default function ShowcaseCanvasLoader() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", height: "480px" }}
    >
      <ShowcaseScene />
    </div>
  );
}
