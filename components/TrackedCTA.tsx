"use client";

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
  return (
    <a
      href={href}
      className={className}
      style={style}
      target={target}
      rel={rel}
      onClick={() => track(event, data)}
    >
      {children}
    </a>
  );
}
