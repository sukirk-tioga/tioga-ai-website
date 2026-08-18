"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { readCssToken } from "@/lib/site-config";

// A slow, near-black, custom fragment shader field behind the homepage
// hero copy -- Phase 3 of the boundary-push research (see
// research/3d-web-design-boundary-push-2026-08-15.md, both passes), the
// homepage was flagged as the single highest-leverage gap on the site: the
// highest-traffic page had less motion than a default template while a
// noindex'd showcase page had four rewrites.
//
// Deliberately restrained per the same brief that produced it: dark, slow,
// on-brand, ~15-20% perceived intensity, pure ambient chrome -- nothing
// here encodes a value, so the honesty rule's own test ("what is that
// motion telling me?" / "nothing, it's chrome") is trivially satisfied,
// same as the showcase gate's scan ring and breathing disc.
//
// Vertex shader writes clip-space position directly (position.xy is
// already -1..1 from the 2x2 plane below), bypassing the camera entirely
// -- the standard "fullscreen shader quad" technique, and it means this
// component can never suffer a camera/resize-math bug: whatever the
// canvas size, the quad always exactly fills it.
const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Ashima Arts' 2D simplex noise (webgl-noise), reproduced verbatim -- the
// standard, extremely widely-used reference implementation, not a
// from-scratch derivation. FBM (fractal Brownian motion) layers four
// octaves for a softer, more organic field than raw noise. Two offset FBM
// samples, drifting at slightly different rates, produce "ridge lines"
// where they nearly cancel -- that's where the accent color shows through;
// everywhere else stays close to the background token.
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uFlowAngle;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform vec3 uColorDark;
  uniform vec3 uBg;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amp * snoise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0) * 1.4;
    // Base drift direction, rotated by uFlowAngle -- driven by homepage
    // scroll position (Phase 4), not by any real value. Purely chrome: the
    // rotation says "you scrolled," never "this represents an event."
    vec2 baseDir = vec2(0.02, 0.012);
    float ca = cos(uFlowAngle);
    float sa = sin(uFlowAngle);
    vec2 rotatedDir = vec2(baseDir.x * ca - baseDir.y * sa, baseDir.x * sa + baseDir.y * ca);
    vec2 flow = rotatedDir * uTime;
    float n = fbm(p * 1.1 + flow);

    // Soft banded glow directly from the drifting noise field -- more
    // reliably visible than a ridge-difference trick, still organic
    // because it's still FBM, and still trivially "chrome" (no band
    // boundary encodes anything specific).
    float intensity = smoothstep(0.02, 0.65, n);
    vec3 glow = mix(uColorDark, uColor, smoothstep(-0.15, 0.4, n));
    vec3 color = mix(uBg, glow, intensity * 0.4);

    float vignette = smoothstep(1.15, 0.25, length(vUv - 0.5) * 1.3);
    color = mix(uBg, color, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Field({ flowAngleRef }: { flowAngleRef?: React.MutableRefObject<number> }) {
  const { size } = useThree();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFlowAngle: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uColor: { value: new THREE.Color(readCssToken("--accent")) },
        uColorDark: { value: new THREE.Color(readCssToken("--accent-dark")) },
        uBg: { value: new THREE.Color(readCssToken("--bg-darker")) },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      depthWrite: false,
      depthTest: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    material.uniforms.uResolution.value.set(size.width, size.height);
  }, [material, size]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (document.hidden) return;
    material.uniforms.uTime.value = clock.elapsedTime;
    // Read the ref every frame -- driven by a GSAP ScrollTrigger scrub on
    // the homepage (Phase 4), never by React state (see design standard's
    // "never drive React state from scroll" rule). Optional: /showcase and
    // any other consumer of this component simply never pass it, so
    // uFlowAngle stays 0 and the field's original fixed drift is unchanged.
    if (flowAngleRef) material.uniforms.uFlowAngle.value = flowAngleRef.current;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function HeroFieldScene({
  onContextLost,
  flowAngleRef,
}: {
  onContextLost: () => void;
  flowAngleRef?: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            onContextLost();
          },
          { once: true }
        );
      }}
    >
      <Field flowAngleRef={flowAngleRef} />
    </Canvas>
  );
}
