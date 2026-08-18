import * as THREE from "three";
import { LEDGER } from "../../../lib/governance-ledger";

// Rasterizes the real 17-row ledger to an offscreen canvas, one row of real
// text per LEDGER entry, and reads it back as the GPGPU particle field's
// reference texture -- boundary-push plan Phase 5 Part A's R/G/B scheme:
// R = glyph ink mask, G = a soft/blurred version of R (the "smoothed
// influence field" so cursor effects bridge between rows instead of
// jumping), B = unused (kept at 0, reserved).
//
// Row index is NOT baked into this texture -- it's derived directly from a
// particle's own V coordinate in the simulation shader (row = floor(v *
// ROW_COUNT)), since the table is laid out row-by-row and that's a pure
// function of position. One less texture to sample per particle per frame.
//
// HONEST SCOPING NOTE (read before assuming this renders legible text):
// the plan's own risk register names this "genuinely hard... budget 2-3
// iterations... have a fallback where particles form the row-shape without
// glyph legibility." At the desktop particle budget (40,000, a 320x125
// grid -- each row gets ~7px of vertical resolution), individual characters
// are not going to read as crisp typography at any on-screen size this
// canvas actually renders at. This still rasterizes the REAL row text (not
// a placeholder bar), so the field's internal structure and per-row
// variation are genuinely derived from real data, not synthesized -- it's
// the documented fallback ("row-shape from real text"), not the reach
// goal ("individually readable digits"). Don't claim glyph legibility in
// any user-facing copy this feeds.

export const FIELD_WIDTH = 320;
export const FIELD_HEIGHT = 125; // 320 * 125 = 40,000 -- exact desktop particle budget
export const MOBILE_WIDTH = 128;
export const MOBILE_HEIGHT = 63; // 128 * 63 = 8,064 -- close to the 8k mobile budget
export const ROW_COUNT = LEDGER.length; // 17

function rowLabel(row: (typeof LEDGER)[number]): string {
  // Compact, real fields only -- same data /demos/governance-ledger shows,
  // just formatted to fit one row at low resolution: served model, real
  // token in->out, real cost.
  return `${row.served}  ${row.in}>${row.out}  ${row.cost}`;
}

function rasterize(width: number, height: number): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas context unavailable -- cannot rasterize ledger texture");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";

  const rowHeight = height / ROW_COUNT;
  const fontSize = Math.max(Math.floor(rowHeight * 0.82), 6);
  ctx.font = `${fontSize}px "JetBrains Mono", "Fira Code", monospace`;

  LEDGER.forEach((row, i) => {
    // Row 0 at the TOP of the canvas, matching reading order and matching
    // the existing corridor's own tileY() (index 0 = top). Canvas Y grows
    // downward already, so this needs no flip here -- the flip (if any)
    // happens where this texture is sampled against a WebGL V coordinate,
    // handled once in the simulation shader, not duplicated here.
    const y = rowHeight * (i + 0.5);
    ctx.fillText(rowLabel(row), width * 0.02, y, width * 0.96);
  });

  return ctx.getImageData(0, 0, width, height);
}

// Simple separable box blur, radius in texels -- cheap and sufficient for
// a "smoothed influence field," not trying to be a real Gaussian.
function boxBlur(src: Uint8ClampedArray, width: number, height: number, radius: number): Float32Array {
  const out = new Float32Array(width * height);
  const tmp = new Float32Array(width * height);
  const norm = 1 / (radius * 2 + 1);

  for (let y = 0; y < height; y++) {
    let acc = 0;
    for (let x = -radius; x <= radius; x++) {
      const xc = Math.min(Math.max(x, 0), width - 1);
      acc += src[(y * width + xc) * 4] / 255;
    }
    for (let x = 0; x < width; x++) {
      tmp[y * width + x] = acc * norm;
      const addX = Math.min(x + radius + 1, width - 1);
      const subX = Math.max(x - radius, 0);
      acc += src[(y * width + addX) * 4] / 255 - src[(y * width + subX) * 4] / 255;
    }
  }

  for (let x = 0; x < width; x++) {
    let acc = 0;
    for (let y = -radius; y <= radius; y++) {
      const yc = Math.min(Math.max(y, 0), height - 1);
      acc += tmp[yc * width + x];
    }
    for (let y = 0; y < height; y++) {
      out[y * width + x] = acc * norm;
      const addY = Math.min(y + radius + 1, height - 1);
      const subY = Math.max(y - radius, 0);
      acc += tmp[addY * width + x] - tmp[subY * width + x];
    }
  }

  return out;
}

export function buildLedgerRefTexture(mobile: boolean): THREE.DataTexture {
  const width = mobile ? MOBILE_WIDTH : FIELD_WIDTH;
  const height = mobile ? MOBILE_HEIGHT : FIELD_HEIGHT;
  const raster = rasterize(width, height);
  const blurred = boxBlur(raster.data, width, height, mobile ? 1 : 2);

  const data = new Float32Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const ink = raster.data[i * 4] / 255; // R channel of the rasterized canvas
    data[i * 4 + 0] = ink; // R: hard ink mask
    data[i * 4 + 1] = blurred[i]; // G: smoothed influence field
    data[i * 4 + 2] = 0; // B: reserved
    data[i * 4 + 3] = 1;
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}
