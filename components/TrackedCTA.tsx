"use client";

import { track } from "@vercel/analytics";

interface TrackedCTAProps {
  href: string;
  event: string;
  data?: Record<string, string | number | boolean>;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function TrackedCTA({ href, event, data, className, style, children }: TrackedCTAProps) {
  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={() => track(event, data)}
    >
      {children}
    </a>
  );
}
