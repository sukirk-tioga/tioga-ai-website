"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

interface TrackedCTAProps {
  href: string;
  event: string;
  data?: Record<string, string | number | boolean>;
  className?: string;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

export default function TrackedCTA({ href, event, data, className, style, target, rel, children }: TrackedCTAProps) {
  const handleClick = () => track(event, data);

  // target="_blank" here always means an external link or a static asset
  // under /public (e.g. a downloadable .html sample) — next/link's
  // client-side router expects an app route, not a raw file or an off-site
  // URL, so those need a real <a> tag.
  if (target === "_blank") {
    return (
      <a href={href} className={className} style={style} target={target} rel={rel} onClick={handleClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style} onClick={handleClick}>
      {children}
    </Link>
  );
}
