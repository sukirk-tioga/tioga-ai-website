"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { LEDGER, REPLAY_START_OFFSETS } from "../../../lib/governance-ledger";
import { CORRIDOR_X, TILE_Y_RANGE, ROW_POOL_POSITIONS } from "../corridorLayout";
import { buildLedgerRefTexture, FIELD_WIDTH, FIELD_HEIGHT, MOBILE_WIDTH, MOBILE_HEIGHT } from "./ledgerTexture";
import {
  velocityFragmentShader,
  positionFragmentShader,
  renderVertexShader,
  renderFragmentShader,
} from "./shaders";

// Phase 5a (boundary-push plan, GPGPU ledger field) -- replaces the plain
// box-tile column with the real 17-row ledger table rasterized to a GPU
// particle field. At rest the particles hold the table's real shape
// (see gpgpu/ledgerTexture.ts's honest-scoping note on what "hold the
// table" actually resolves to at this particle budget). On pointer
// proximity they scatter along a flow field with velocity-dependent
// turning, then spring back. During Replay, each row's own particles
// detach from the table and fly a corridor arc toward the gate and on to
// that row's real backend pool, landing there briefly before easing home
// -- driven by the same REPLAY_START_OFFSETS/REPLAY_TRAVEL_DURATION
// timing Ribbons/Pulses already use (this component tracks its own
// play/elapsed state from the same playSignal prop rather than sharing
// Pulses' internal refs, so Pulses -- already tuned and verified -- is
// left untouched).
//
// TABLE_HEIGHT/TABLE_WIDTH are the world-space footprint the rasterized
// rows occupy, replacing the old RowTiles column at the same CORRIDOR_X.tiles
// depth.
const TABLE_CENTER = new THREE.Vector3(CORRIDOR_X.tiles, 0, 0);
const TABLE_HEIGHT = TILE_Y_RANGE[0] - TILE_Y_RANGE[1]; // 5.2
const TABLE_WIDTH = 2.6;

const REPLAY_HOLD_SECONDS = 1.4;
const POINTER_RADIUS = 1.1;
const SPRING_STRENGTH = 9.0;
const DAMPING = 0.9;
// Calibrated against a live screenshot, not guessed -- the first pass
// (2.4) rendered each point at ~60px, merging every row's ink into one
// large blob instead of a fine field. 300/-mvPosition.z in the vertex
// shader evaluates to roughly 25-30 at this scene's camera distance, so a
// ~2px on-screen point needs a size constant around 0.08.
const PARTICLE_SIZE = 0.09;

interface Tokens {
  accent: string;
  accentDark: string;
}

function buildParticleUvGeometry(width: number, height: number): THREE.BufferGeometry {
  const count = width * height;
  const positions = new Float32Array(count * 3); // unused by the shader, required by THREE.Points
  const uvs = new Float32Array(count * 2);
  let p = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      uvs[p * 2 + 0] = (x + 0.5) / width;
      uvs[p * 2 + 1] = (y + 0.5) / height;
      p++;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

export default function LedgerParticleField({
  tokens,
  playSignal,
  isMobile,
}: {
  tokens: Tokens;
  playSignal: number;
  isMobile: boolean;
}) {
  const { gl } = useThree();
  const isPlaying = useRef(false);
  const playStart = useRef(0);
  const lastPlaySignal = useRef(playSignal);
  const raycasterRef = useRef(new THREE.Raycaster());

  const width = isMobile ? MOBILE_WIDTH : FIELD_WIDTH;
  const height = isMobile ? MOBILE_HEIGHT : FIELD_HEIGHT;

  const geometry = useMemo(() => buildParticleUvGeometry(width, height), [width, height]);

  const paidRowFrac = useMemo(() => LEDGER.map((row) => (row.pool === "paid" ? 1 : 0)), []);
  const rowPoolVectors = useMemo(
    () => ROW_POOL_POSITIONS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    []
  );
  const rowStartOffsets = useMemo(() => LEDGER.map((_, i) => REPLAY_START_OFFSETS[i] ?? 0), []);

  const gpu = useMemo(() => {
    const refTexture = buildLedgerRefTexture(isMobile);

    const gpuCompute = new GPUComputationRenderer(width, height, gl);

    const dtPosition = gpuCompute.createTexture();
    const dtVelocity = gpuCompute.createTexture();

    // Seed both textures so particles start already resting on the table --
    // not flying in from the origin on first frame.
    {
      const posData = dtPosition.image.data as Float32Array;
      let i = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const u = (x + 0.5) / width;
          const v = (y + 0.5) / height;
          const wy = TABLE_CENTER.y + (0.5 - v) * TABLE_HEIGHT;
          const wz = TABLE_CENTER.z + (u - 0.5) * TABLE_WIDTH;
          posData[i * 4 + 0] = TABLE_CENTER.x;
          posData[i * 4 + 1] = wy;
          posData[i * 4 + 2] = wz;
          posData[i * 4 + 3] = 1;
          i++;
        }
      }
    }

    const positionVariable = gpuCompute.addVariable("texturePosition", positionFragmentShader, dtPosition);
    const velocityVariable = gpuCompute.addVariable("textureVelocity", velocityFragmentShader, dtVelocity);
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
    gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);

    const sharedUniforms = {
      uRefTexture: { value: refTexture },
      uTableCenter: { value: TABLE_CENTER },
      uTableHeight: { value: TABLE_HEIGHT },
      uTableWidth: { value: TABLE_WIDTH },
      uRowPool: { value: rowPoolVectors },
      uReplayElapsed: { value: -1 },
      uReplayTravelDuration: { value: 1.1 },
      uReplayStartOffset: { value: rowStartOffsets },
      uReplayHoldSeconds: { value: REPLAY_HOLD_SECONDS },
      uDelta: { value: 0 },
    };

    Object.assign(positionVariable.material.uniforms, sharedUniforms);
    Object.assign(velocityVariable.material.uniforms, sharedUniforms, {
      uPointer: { value: new THREE.Vector3() },
      uPointerActive: { value: 0 },
      uPointerRadius: { value: POINTER_RADIUS },
      uSpringStrength: { value: SPRING_STRENGTH },
      uDamping: { value: DAMPING },
    });

    const error = gpuCompute.init();
    if (error !== null) {
      console.error("[LedgerParticleField] GPUComputationRenderer init error:", error);
    }

    return { gpuCompute, positionVariable, velocityVariable, refTexture };
  }, [gl, width, height, isMobile, rowPoolVectors, rowStartOffsets]);

  const renderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      uniforms: {
        uPositionTexture: { value: null },
        uRefTexture: { value: gpu.refTexture },
        uParticleSize: { value: PARTICLE_SIZE },
        uColorFree: { value: new THREE.Color(tokens.accent) },
        uColorPaid: { value: new THREE.Color(tokens.accentDark) },
        uPaidRowFrac: { value: paidRowFrac },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [gpu, tokens, paidRowFrac]);

  useEffect(() => {
    if (playSignal === lastPlaySignal.current) return;
    lastPlaySignal.current = playSignal;
    isPlaying.current = true;
    playStart.current = -1;
  }, [playSignal]);

  useEffect(() => {
    return () => {
      gpu.gpuCompute.dispose?.();
      geometry.dispose();
      renderMaterial.dispose();
    };
  }, [gpu, geometry, renderMaterial]);

  useFrame(({ clock, pointer, camera }, delta) => {
    const dt = Math.min(delta, 1 / 30);

    if (isPlaying.current && playStart.current === -1) {
      playStart.current = clock.elapsedTime;
    }
    const elapsedSincePlay = isPlaying.current ? clock.elapsedTime - playStart.current : -1;
    if (isPlaying.current && elapsedSincePlay > 8.5) {
      isPlaying.current = false;
    }

    const velUniforms = gpu.velocityVariable.material.uniforms;
    const posUniforms = gpu.positionVariable.material.uniforms;
    posUniforms.uDelta.value = dt;
    velUniforms.uDelta.value = dt;
    posUniforms.uReplayElapsed.value = elapsedSincePlay;
    velUniforms.uReplayElapsed.value = elapsedSincePlay;

    // Pointer -> table-plane (x = TABLE_CENTER.x) world intersection, only
    // while the pointer has moved recently -- avoids a stale ray keeping
    // the scatter force active when the mouse hasn't actually been over
    // the canvas.
    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(pointer, camera);
    const denom = raycaster.ray.direction.x;
    let active = 0;
    if (Math.abs(denom) > 1e-5) {
      const t = (TABLE_CENTER.x - raycaster.ray.origin.x) / denom;
      if (t > 0) {
        const hit = raycaster.ray.origin.clone().addScaledVector(raycaster.ray.direction, t);
        if (Math.abs(hit.y - TABLE_CENTER.y) < TABLE_HEIGHT && Math.abs(hit.z - TABLE_CENTER.z) < TABLE_WIDTH) {
          velUniforms.uPointer.value.copy(hit);
          active = 1;
        }
      }
    }
    velUniforms.uPointerActive.value = active;

    gpu.gpuCompute.compute();
    renderMaterial.uniforms.uPositionTexture.value = gpu.gpuCompute.getCurrentRenderTarget(
      gpu.positionVariable
    ).texture;
  });

  return <points geometry={geometry} material={renderMaterial} />;
}
