"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// The /solutions shared renderer's abstract space (Phase 4, "Cartier"
// set piece: research/3d-web-design-boundary-push-2026-08-15.md lines
// 707-711 -- "one shared renderer, one shared transition system... each
// solution gets a distinct camera position and lighting mood in the same
// abstract space").
//
// Honest scope note: this reuses HeroFieldScene's proven fullscreen-quad
// shader technique (vertex shader writes clip-space directly, so there's
// no real 3D camera to move through geometry) rather than building a new
// lit 3D scene from scratch. "Camera position" and "lighting mood" are
// real, visible, GSAP-tweened parameters on the *same* shared field --
// uTint (the mood's accent color) and uPan (a 2D offset into the noise
// field, standing in for camera position since there's no true depth to
// move a camera through). A literal camera-dollying-through-lit-geometry
// version (closer to Cartier's actual six discrete rooms) is a real,
// larger follow-up if more literal fidelity is wanted later -- flagged
// here, not silently substituted.
const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPan;
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
    p += uPan;
    float n = fbm(p * 1.05 + uTime * 0.01);

    float intensity = smoothstep(0.02, 0.65, n);
    vec3 glow = mix(uColorDark, uColor, smoothstep(-0.15, 0.4, n));
    vec3 color = mix(uBg, glow, intensity * 0.4);

    float vignette = smoothstep(1.15, 0.25, length(vUv - 0.5) * 1.3);
    color = mix(uBg, color, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface SolutionsFieldHandle {
  material: THREE.ShaderMaterial;
}

function Field({
  onReady,
}: {
  onReady: (material: THREE.ShaderMaterial) => void;
}) {
  const { size } = useThree();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uPan: { value: new THREE.Vector2(0, 0) },
        uColor: { value: new THREE.Color("#EC6D3D") },
        uColorDark: { value: new THREE.Color("#0088AA") },
        uBg: { value: new THREE.Color("#05070C") },
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

  useEffect(() => {
    onReady(material);
    return () => material.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material]);

  useFrame(({ clock }) => {
    if (document.hidden) return;
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function SolutionsFieldScene({
  onContextLost,
  onReady,
}: {
  onContextLost: () => void;
  onReady: (material: THREE.ShaderMaterial) => void;
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
      <Field onReady={onReady} />
    </Canvas>
  );
}
