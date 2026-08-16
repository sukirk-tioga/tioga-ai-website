"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Shared scroll-scrubbed reveal wrapper -- the "BlurTextReveal shape" named
// in the boundary-push research (Trionn's pattern): one component
// centralizes the prefers-reduced-motion branch and strips `will-change`
// after the reveal finishes, instead of every section re-implementing its
// own scroll listener. Used for the homepage's sections below the pinned
// hero (Phase 4) -- currently the only consumer, written generically so a
// future page (/changelog, /services, /solutions) can reuse it as-is.
//
// Non-negotiable per the 3D/motion design standard: reduced motion must
// fully bypass this -- children render immediately, fully visible, with no
// GSAP/ScrollTrigger instance created at all, not just an animation that
// finishes at duration 0.

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Vertical offset (px) the content animates in from. */
  y?: number;
  /** Blur (px) the content animates in from. */
  blur?: number;
  /** How "laggy" the scrub feels; matches GSAP's scrub number semantics. */
  scrub?: number;
}

export default function ScrollReveal({ children, className, y = 36, blur = 6, scrub = 0.6 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return; // static, fully visible, no ScrollTrigger created

    el.style.willChange = "opacity, transform, filter";
    gsap.set(el, { opacity: 0, y, filter: `blur(${blur}px)` });

    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        end: "top 55%",
        scrub,
      },
      onComplete: () => {
        el.style.willChange = "auto";
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      el.style.willChange = "auto";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
