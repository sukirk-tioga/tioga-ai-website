"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import HeroFieldLoader from "@/components/HeroFieldLoader";
import HeroDemo from "@/components/HeroDemo";
import TrackedCTA from "@/components/TrackedCTA";
import { CAL_LINK } from "@/lib/site-config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

// Homepage set piece (Phase 4 of the boundary-push plan): pins the hero for
// one extra viewport-height of scroll. Over that scrub range the shader
// field's flow direction rotates (HeroFieldScene's uFlowAngle uniform, pure
// chrome, see its own comment). Everything below this component (the rest
// of the homepage) scrolls normally underneath once the pin releases.
//
// The stat-strip that used to live here (four numbers pulled from
// lib/governance-ledger.ts's STATS, counting up on scrub) was removed
// 2026-09-07 per the Astra + Fable adversarial launch-readiness reviews:
// both independently flagged a small internal-infrastructure metric
// ("17 calls logged," etc.) sitting in the primary hero/conversion path as
// evidence of experimentation scale, not customer-facing proof, and noise
// against the narrower one-buyer/one-workflow hero message below. The same
// data is still real and still on the site -- see the "Governance Ledger
// Callout" section further down this page (GovernanceLedgerPreview) and
// the full /demos/governance-ledger page -- just no longer in the very
// first thing a visitor sees.
//
// Lenis + GSAP's shared clock, and the pin/scrub itself, are the two things
// this component owns; the rest of the homepage's scrub reveals live in the
// generic <ScrollReveal> component instead of being duplicated here.
//
// Rotation range for the flow field over the full pin scrub. A visible but
// unhurried directional shift, not a spin -- "rotates," not "spins."
const FLOW_ROTATION_RADIANS = Math.PI; // 180°

export default function HomeHeroPinned() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const flowAngleRef = useRef(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      // Hard bypass, not a softened version of the same effect: no Lenis,
      // no ScrollTrigger pin, no SplitText split, no flow rotation. The
      // section renders as a normal, already-fully-visible part of the
      // document. The headline ships opacity-0 in its static className (fixes a
      // first-paint double-render flash in the animated path below) --
      // this bypass must explicitly reveal it since it never reaches the
      // gsap.set() call that does that on the animated path.
      if (headlineRef.current) gsap.set(headlineRef.current, { opacity: 1 });
      return;
    }

    // --- Lenis + GSAP: one shared clock, the named fix for scroll-3D
    // jitter (research doc §2.3 / Trionn). Lenis's default mode drives the
    // real document scroll position directly (no transform-wrapper), so
    // this sidesteps the ScrollSmoother wrapper/`effects:false` gotcha
    // entirely -- that gotcha is specific to GSAP's ScrollSmoother, which
    // this build deliberately doesn't use.
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // --- Character-level headline reveal (one-time, not scroll-linked). ---
    // type: "words, chars" (not just "chars") -- splitting straight into
    // chars wraps every character, including spaces, in its own
    // inline-block span, which lets the browser break a line between any
    // two characters instead of only at word boundaries (a real bug: it
    // shipped once as "ERP y| ou already have." mid-word). Splitting words
    // first keeps each word's own wrapper as the line-break unit, then
    // chars animate within it.
    let split: SplitText | null = null;
    if (headlineRef.current) {
      split = new SplitText(headlineRef.current, { type: "words, chars" });
      // Same synchronous block as the split, no frame gap: reveal the
      // headline (shipped opacity-0 in its static className) at the exact
      // moment its characters are ready to animate, instead of relying on
      // the browser's first paint -- that gap is what produced the
      // double-render flash this fixes.
      gsap.set(headlineRef.current, { opacity: 1 });
      gsap.from(split.chars, {
        yPercent: 110,
        opacity: 0,
        duration: 0.7,
        stagger: 0.018,
        ease: "power3.out",
        delay: 0.1,
      });
    }

    // --- Pin + scrub: flow rotation, driven off a mutable ref / direct DOM
    // writes, never React state (design standard's explicit rule --
    // scroll-driven state changes are a performance trap).
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=100%",
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          flowAngleRef.current = self.progress * FLOW_ROTATION_RADIANS;
        },
      });
    }, sectionRef);

    // Real bug, caught only by actually testing a `/#contact`-style deep
    // link (this site's own established CTA convention, ~17 links): the
    // pin's spacer div adds roughly one viewport height of extra
    // document height. The browser's native "scroll to the URL fragment
    // on initial load" runs once, synchronously, against the pre-pin
    // layout -- before this effect has created the spacer -- so it lands
    // short of the real target by however much height the spacer just
    // added above it (e.g. `/#contact` landed on the Process section
    // instead). Re-run the same scroll once the pin/spacer layout has
    // settled.
    if (window.location.hash) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        // Lenis clamps scrollTo's target against its own cached scroll
        // limit, which was computed at `new Lenis()` time -- before the
        // pin spacer above added height to the document. Without an
        // explicit resize() here, that stale (too-small) limit clamps the
        // target short of the real element, landing one pinned-hero's
        // worth of scroll short of it (caught by actually testing a
        // `/#contact` deep link, not by reading the code).
        lenis.resize();
        lenis.scrollTo(window.location.hash, { immediate: true });
      });
    }

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      split?.revert();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="pt-36 pb-12 px-6 max-w-5xl mx-auto text-center md:text-left relative z-0 overflow-hidden">
        <HeroFieldLoader flowAngleRef={flowAngleRef} />
        <h1 ref={headlineRef} className="text-5xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight text-balance opacity-0" style={{ color: "var(--text)" }}>
          From idea to an AI agent running in your real systems — built, connected, and governed by the principal responsible for the work.
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto md:mx-0 mb-3 leading-relaxed">
          Whether you run QuickBooks or Oracle EBS, an AI agent that touches your system of record needs a safe implementation: the right connection, clear controls, and evidence of what it did — who approved it, what it accessed, what it changed, and why. The depth of that work changes with the system and the risk; the standard doesn&apos;t.
        </p>
        <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto md:mx-0 mb-8">
          Five-day discovery sprint, $5,000 flat — scoped to your workflow, credited toward what comes next.
        </p>
        <div className="flex flex-col items-center sm:flex-row gap-4 justify-center md:justify-start">
          <TrackedCTA
            href={CAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            event="cta_book_call"
            data={{ location: "hero" }}
            className="px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--accent-dark)" }}
          >
            Book a 20-minute fit call
          </TrackedCTA>
          <TrackedCTA
            href="/ai-fit-check"
            event="cta_ai_fit_check"
            data={{ location: "hero" }}
            className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-[var(--text)]"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            Start with the AI Fit Check — $1,500
          </TrackedCTA>
        </div>
        <HeroDemo />
      </section>
    </div>
  );
}
