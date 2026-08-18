"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

// Phase 4 "Shopify Editions" set piece for /changelog (research doc lines
// 702-705): each entry's title disperses into particles on exit and
// reassembles on entry. Honest scope note: this uses SplitText character
// scattering (random per-char offset/rotation/blur/opacity, GSAP-tweened)
// rather than a true GPU particle system -- the literal "typography
// rasterized to a texture and blown apart as particles" technique from the
// research doc's §1.9 (basement.studio's channel-encoded-FBO recipe) is a
// real, heavier build earmarked for a later phase if wanted; this delivers
// the same visual read (character-level scatter/reassemble) at a fraction
// of the cost, appropriate for repeating across all 26 entries on one page.
//
// Two independent, tightly-scoped ScrollTriggers per entry (enter/exit)
// rather than one labeled timeline with a "hold" segment in between --
// found by screenshotting scrollY=0 on initial load (zero console errors,
// would pass any assertion-based test): a single scrubbed timeline needs
// its label spacing tuned in lockstep with each entry's actual on-page
// position, and the first 1-2 entries sit far enough down the initial
// viewport that they land mid-transition rather than in the "held"
// segment no matter how the labels were spaced. Two decoupled triggers
// sidestep that entirely -- the enter tween's start/end is scoped tightly
// to "just entering the bottom of the viewport," the exit tween's start/end
// is scoped tightly to "already past a comfortable reading position," and
// the gap between them (no active tween) is what holds the assembled
// state, with no timeline-position math to keep in sync.
const ENTER_DURATION = 0.35;
const EXIT_DURATION = 0.35;

export default function ChangelogBeat({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return; // static, fully visible, no SplitText/ScrollTrigger created

    const split = new SplitText(el, { type: "chars" });
    el.style.willChange = "opacity, transform, filter";

    // Deterministic per-char scatter offsets (seeded by index, not
    // Math.random()) so the enter and exit animations use the same
    // scatter geometry, just mirrored.
    const scatter = split.chars.map((_, i) => ({
      x: ((i * 37) % 60) - 30,
      y: ((i * 53) % 50) - 25,
      rot: ((i * 29) % 40) - 20,
    }));

    const enterTween = gsap.from(split.chars, {
      opacity: 0,
      filter: "blur(6px)",
      x: (i) => scatter[i].x,
      y: (i) => scatter[i].y,
      rotation: (i) => scatter[i].rot,
      duration: ENTER_DURATION,
      stagger: { each: 0.006, from: "random" },
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 95%",
        end: "top 65%",
        scrub: 0.4,
      },
    });

    const exitTween = gsap.to(split.chars, {
      opacity: 0,
      filter: "blur(6px)",
      x: (i) => scatter[i].x * -1,
      y: (i) => scatter[i].y * -1,
      rotation: (i) => scatter[i].rot * -1,
      duration: EXIT_DURATION,
      stagger: { each: 0.006, from: "random" },
      ease: "power2.in",
      scrollTrigger: {
        trigger: el,
        start: "top 30%",
        end: "top -30%",
        scrub: 0.4,
      },
    });

    // Force an immediate resync against current scroll position for both
    // triggers -- same fix as the enter/exit split above was built to
    // avoid needing, but cheap insurance: without it, a tween created
    // after the page has already scrolled past its range would still
    // require one real scroll event before settling into the correct
    // (here: fully assembled or fully dispersed) rest state.
    [enterTween.scrollTrigger, exitTween.scrollTrigger].forEach((st) => st?.refresh());

    return () => {
      enterTween.scrollTrigger?.kill();
      exitTween.scrollTrigger?.kill();
      enterTween.kill();
      exitTween.kill();
      split.revert();
      el.style.willChange = "auto";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <h2 ref={titleRef} className={className}>
      {children}
    </h2>
  );
}
