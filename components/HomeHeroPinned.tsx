"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import HeroFieldLoader from "@/components/HeroFieldLoader";
import HeroDemo from "@/components/HeroDemo";
import TrackedCTA from "@/components/TrackedCTA";
import { STATS } from "@/lib/governance-ledger";
import { makeCountUpFormatter } from "@/lib/count-up-format";
import { CAL_LINK } from "@/lib/site-config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

// Homepage set piece (Phase 4 of the boundary-push plan): pins the hero for
// one extra viewport-height of scroll. Over that scrub range the shader
// field's flow direction rotates (HeroFieldScene's uFlowAngle uniform, pure
// chrome, see its own comment) and the four governance-ledger stat numbers
// count up. Everything below this component (the rest of the homepage)
// scrolls normally underneath once the pin releases.
//
// Lenis + GSAP's shared clock, and the pin/scrub itself, are the two things
// this component owns; the rest of the homepage's scrub reveals live in the
// generic <ScrollReveal> component instead of being duplicated here.
//
// Rotation range for the flow field over the full pin scrub. A visible but
// unhurried directional shift, not a spin -- "rotates," not "spins."
const FLOW_ROTATION_RADIANS = Math.PI; // 180°

// Stats count up over only the first slice of the pin's scroll range (a
// quick "kick" once the visitor starts scrolling) rather than linearly
// across the whole pin. Two reasons: (1) the design standard's own
// "design the rest state first" principle -- most visitors land here and
// the very first frame they see (scrollY = 0, before any interaction) must
// show the real numbers, never a zeroed stat that reads as broken; (2) once
// counted up, holding at the true value for the remainder of the pin keeps
// the "count up on scrub" spec (the numbers are genuinely progress-driven,
// not time-driven) while avoiding a slow crawl the whole scroll range.
const COUNT_UP_SCRUB_FRACTION = 0.18;

const statFormatters = STATS.map((s) => makeCountUpFormatter(s.value));

export default function HomeHeroPinned() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const statValueRefs = useRef<Array<HTMLDivElement | null>>([]);
  const flowAngleRef = useRef(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      // Hard bypass, not a softened version of the same effect: no Lenis,
      // no ScrollTrigger pin, no SplitText split, no flow rotation. The
      // section renders as a normal, already-fully-visible part of the
      // document; stats already show their real SSR'd values (see JSX).
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
      gsap.from(split.chars, {
        yPercent: 110,
        opacity: 0,
        duration: 0.7,
        stagger: 0.018,
        ease: "power3.out",
        delay: 0.1,
      });
    }

    // --- Pin + scrub: flow rotation + stat count-up, both driven off a
    // mutable ref / direct DOM writes, never React state (design standard's
    // explicit rule -- scroll-driven state changes are a performance trap).
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=100%",
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          flowAngleRef.current = self.progress * FLOW_ROTATION_RADIANS;

          // Force-restore the real resting values below a small epsilon,
          // not exactly 0 -- measured in practice, ScrollTrigger's pin
          // calculation leaves a persistent sub-pixel-rounding progress
          // around 1e-6 even at true scrollY 0 (the pin-spacer's computed
          // height isn't bit-identical to the pinned element's), so an
          // exact `progress <= 0` check is never true at rest and the
          // count-up formatter would render an always-visible near-zero
          // value. Restoring (not just skipping) below the epsilon also
          // makes this self-healing if the visitor scrolls back to the top.
          const REST_EPSILON = 0.005;
          if (self.progress <= REST_EPSILON) {
            statValueRefs.current.forEach((el, i) => {
              if (el) el.textContent = STATS[i].value;
            });
            return;
          }
          const countUpProgress = Math.min(1, self.progress / COUNT_UP_SCRUB_FRACTION);
          statValueRefs.current.forEach((el, i) => {
            if (el) el.textContent = statFormatters[i](countUpProgress);
          });
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
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center relative z-0 overflow-hidden">
        <HeroFieldLoader flowAngleRef={flowAngleRef} />
        <h1 ref={headlineRef} className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight text-balance">
          AI agents for the{" "}
          <span style={{ color: "var(--accent)" }}>systems</span>{" "}
          you already have.
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-3 leading-relaxed">
          Governed agents for finance, procurement and operations on Oracle EBS and SAP — now extending to Salesforce, ServiceNow and the data platforms they sit beside — running inside your identity, approvals and audit trail, every action visible before it executes. No migration required.
        </p>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mb-10">
          Five-day discovery sprint, $5,000 flat — credited toward your project if you move forward.
        </p>
        <div className="flex flex-col items-center sm:flex-row gap-4 justify-center">
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
            href="/demos/ap-exception-workflow"
            event="cta_view_demo"
            data={{ location: "hero" }}
            className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-500 hover:text-white"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            See an AP agent run
          </TrackedCTA>
        </div>
        <HeroDemo />
      </section>

      {/* Stats Bar — real governance-ledger numbers (see
          lib/governance-ledger.ts's STATS), count up as the pinned hero is
          scrolled through. Presentation of a static, already-published
          number, not a claim of live/current data — see the dated label
          below, which must never say "now" or "live" (design standard §3). */}
      <section className="px-6 pb-8 max-w-5xl mx-auto">
        <p className="text-center text-xs uppercase tracking-wide mb-3" style={{ color: "var(--text-muted-3)" }}>
          From Tioga&apos;s own AI governance ledger · Jul 17–25 2026
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ background: "var(--border)" }}>
          {STATS.map((stat, i) => (
            <div key={stat.label} className="px-6 py-5 text-center" style={{ background: "var(--bg-card)" }}>
              <div
                ref={(el) => {
                  statValueRefs.current[i] = el;
                }}
                className="text-2xl font-bold mb-1 font-mono"
                style={{ color: "var(--accent)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
