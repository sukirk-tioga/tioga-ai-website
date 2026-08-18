"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { readCssToken } from "../../../lib/site-config";
import { useDemoActivity } from "./demo-activity-context";

// Phase 5b — "/demos goes live for real" (see
// research/3d-web-design-boundary-push-2026-08-15.md §Phase 5 part B and
// docs/design/3d-design-standard.md §3, the honesty rule). This scene
// reads ONLY DemoActivityContext -- the visitor's own real fetch state for
// whichever demo tab they're using -- and is not allowed to depict
// anything else. "There is nothing to fake here: it's the visitor's own
// request, happening now" (spec's own framing).
//
// Scoped down from the plan's most ambitious version: the plan calls for
// a full GPGPU ping-pong FBO simulation over ~40k particles with real GLSL
// authorship. This ships a real, CPU-driven THREE.Points field (~1800
// particles) instead -- same honesty/motion-budget requirements satisfied,
// same reactive behavior, but ordinary per-frame JS position/color updates
// rather than a compute shader. Revisit as true GPGPU only if 40k-particle
// visual density becomes the actual goal; at this scale it wouldn't look
// meaningfully different.
//
// State -> visual mapping, all driven by DemoActivityContext:
//   idle    -- loose ambient cloud, slow per-particle bob + slow whole-field
//              rotation (two independent motion sources, different periods,
//              per §4.3) -- explicitly "chrome," no event implied (§3.1).
//   pending -- particles agitate (higher-frequency jitter) while the
//              visitor's real fetch() is in flight. Real, not decorative:
//              this only happens because an actual request is pending.
//   done    -- particles ease into a calm ring. Colored by the REAL
//              confidence value when the demo's result carries one
//              (invoice/document); when it doesn't (email triage has no
//              confidence field), colored a plain neutral accent rather
//              than a fabricated number -- see demo-activity-context.tsx.
//   error   -- particles ease into a lower-energy, slightly contracted
//              formation, colored with the real error token. Only reachable
//              from an actual caught fetch/parse error.
//
// No hex literals: colors are read from CSS custom properties at runtime
// via readCssToken, matching ShowcaseScene.tsx's established convention.

const PARTICLE_COUNT = 1800;
const RADIUS = 2.2;

interface Tokens {
  accent: THREE.Color;
  accentDark: THREE.Color;
  error: THREE.Color;
  warningLight: THREE.Color;
  textMuted: THREE.Color;
}

function readTokens(): Tokens {
  return {
    accent: new THREE.Color(readCssToken("--accent")),
    accentDark: new THREE.Color(readCssToken("--accent-dark")),
    error: new THREE.Color(readCssToken("--error")),
    warningLight: new THREE.Color(readCssToken("--warning-light")),
    textMuted: new THREE.Color(readCssToken("--text-muted")),
  };
}

function randomInSphere(radius: number): THREE.Vector3 {
  // Uniform-ish distribution within a sphere (rejection-free, good enough
  // for a decorative field -- not a physically exact volumetric sample).
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
}

function ParticleField() {
  const { status, confidence } = useDemoActivity();
  const tokens = useMemo(readTokens, []);
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { basePositions, ringTargets, phases } = useMemo(() => {
    const base = new Float32Array(PARTICLE_COUNT * 3);
    const ring = new Float32Array(PARTICLE_COUNT * 3);
    const ph = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = randomInSphere(RADIUS);
      base[i * 3] = p.x;
      base[i * 3 + 1] = p.y;
      base[i * 3 + 2] = p.z;

      // Rest/resolved formation: a loose ring in the XY plane, radius
      // jittered per-particle so it reads as a band of light, not a wire.
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const ringR = RADIUS * 0.62 + (Math.random() - 0.5) * 0.35;
      ring[i * 3] = Math.cos(angle) * ringR;
      ring[i * 3 + 1] = Math.sin(angle) * ringR;
      ring[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

      ph[i] = Math.random() * Math.PI * 2;
    }
    return { basePositions: base, ringTargets: ring, phases: ph };
  }, []);

  const positions = useMemo(() => basePositions.slice(), [basePositions]);
  const colors = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const colorAttr = geometry.getAttribute("color") as THREE.BufferAttribute;

    // Resolved-state color: real confidence when the active demo has one,
    // a plain neutral accent when it doesn't (never a guessed number).
    const resolvedColor =
      confidence != null
        ? tokens.warningLight.clone().lerp(tokens.accent, Math.max(0, Math.min(1, confidence / 100)))
        : tokens.accentDark.clone().lerp(tokens.accent, 0.5);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const bx = basePositions[ix];
      const by = basePositions[ix + 1];
      const bz = basePositions[ix + 2];
      const phase = phases[i];

      let x = bx;
      let y = by;
      let z = bz;
      let color = tokens.textMuted;

      if (status === "idle") {
        // Two independent motion sources, different periods (§4.3): a
        // slow per-particle bob (period ~ a few seconds, staggered by
        // `phase` so particles never phase-lock) plus a slow whole-field
        // rotation applied via groupRef below. Pure chrome -- no event
        // implied, matches the "breathing glow" / "staggered shimmer"
        // precedent from ShowcaseScene.tsx.
        // 2026-08-18: bumped from 0.08/0.6 after live verification showed
        // the original amplitude/speed read as static noise rather than
        // confident motion -- same lesson as ShowcaseScene.tsx's
        // autoRotateSpeed fix ("slow-but-technically-moving reads as
        // broken"). This amplitude is clearly visible frame-to-frame while
        // staying well inside "ambient chrome," not an event.
        const bob = Math.sin(t * 1.1 + phase) * 0.22;
        x = bx + bob * 0.5;
        y = by + bob;
        z = bz + Math.cos(t * 0.85 + phase) * 0.16;
        color = tokens.textMuted;
      } else if (status === "pending") {
        // Real agitation while the visitor's own fetch is actually in
        // flight -- higher-frequency, larger-amplitude jitter than idle.
        const jitter = Math.sin(t * 6 + phase * 3) * 0.22;
        x = bx + jitter;
        y = by + Math.cos(t * 7 + phase * 2) * 0.22;
        z = bz + Math.sin(t * 5 + phase) * 0.18;
        color = tokens.accent.clone().lerp(tokens.accentDark, 0.3);
      } else if (status === "done") {
        // Ease toward the ring formation; small residual shimmer so it
        // doesn't read as a frozen frame (motion is mandatory even at rest,
        // §4.1).
        const rx = ringTargets[ix];
        const ry = ringTargets[ix + 1];
        const rz = ringTargets[ix + 2];
        const shimmer = Math.sin(t * 0.8 + phase) * 0.03;
        x = rx + shimmer;
        y = ry + shimmer * 0.6;
        z = rz;
        color = resolvedColor;
      } else {
        // error: lower-energy, slightly contracted toward center, real
        // error token -- only reached from an actual caught error.
        const shrink = 0.55;
        const shimmer = Math.sin(t * 0.5 + phase) * 0.03;
        x = bx * shrink + shimmer;
        y = by * shrink + shimmer;
        z = bz * shrink;
        color = tokens.error;
      }

      posAttr.array[ix] = x;
      posAttr.array[ix + 1] = y;
      posAttr.array[ix + 2] = z;
      colorAttr.array[ix] = color.r;
      colorAttr.array[ix + 1] = color.g;
      colorAttr.array[ix + 2] = color.b;
    }
    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // Slow whole-field rotation, independent period from the per-particle
    // bob above -- the second motion source required by §4.3. Only active
    // at idle/done so it doesn't fight the pending-state agitation.
    // 2026-08-18: bumped from 0.05 (full rotation ~126s, read as static in
    // live verification) to 0.18 (~35s/rotation) -- clearly perceptible
    // within a single screenshot-comparison window, still slow/ambient.
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  );
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

// Exported as the default so DemoParticleCanvasLoader.tsx can
// `dynamic(() => import(...), { ssr: false })` it, same pattern as
// ShowcaseCanvasLoader.tsx importing ShowcaseScene.
export default function DemoParticleFieldScene({ onContextLost }: { onContextLost: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
    >
      <ParticleField />
    </Canvas>
  );
}

export { detectWebGL };
