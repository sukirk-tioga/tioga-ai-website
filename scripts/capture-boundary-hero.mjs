// One-off capture script for "The Boundary"'s hero video — records the
// scene's real 5-shot cinematic camera intro (Open -> Enter -> Gate ->
// Boundary -> Resolved, ~17s) directly off the live canvas via
// captureStream()/MediaRecorder, the same real scene a visitor would see
// with `?cinematic=1` forcing the intro to actually run (see
// BoundaryScene.tsx's forceCinematic prop — ordinary visitors never play
// this live, only this capture does).
//
// Not a permanent test — a build tool, run manually:
//   node scripts/capture-boundary-hero.mjs [baseURL]
// Requires a running server at baseURL (default http://localhost:3411).
// Output: scripts/out/boundary-hero-raw.webm (VP9), which
// scripts/encode-boundary-hero.sh then transcodes to the shipped
// mp4/webm + poster.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "out");
mkdirSync(OUT_DIR, { recursive: true });

const baseURL = process.argv[2] ?? "http://localhost:3411";
// CINEMATIC_TOTAL_SECONDS (boundaryLayout.ts) is 3.0+3.5+3.5+4.0+3.0 = 17.0s.
// Record generously past it — R3F's own useFrame clock starts as soon as
// the Canvas mounts, which can be several real seconds before this script's
// captureStream() call actually starts recording (WebGL context creation,
// networkidle wait, canvas-visible wait). Recording a wide margin here and
// trimming precisely in post (see encode step) is more robust than trying
// to shave the pre-recording wait to exactly zero.
const RECORD_MS = 26_000;

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("[page error]", msg.text());
  });
  page.on("pageerror", (err) => console.error("[page exception]", err.message));

  await page.goto(`${baseURL}/demos/standing-watch?cinematic=1`, { waitUntil: "networkidle" });

  const canvas = page.locator('[data-testid="boundary-canvas"] canvas');
  await canvas.waitFor({ state: "visible", timeout: 15_000 });
  // Let the WebGL context + first several frames stabilize before starting
  // the recording clock, so the captured video's t=0 is a clean first shot,
  // not a half-initialized frame.
  await page.waitForTimeout(500);

  console.log("Recording…");
  const base64 = await page.evaluate(async (durationMs) => {
    const canvasEl = document.querySelector('[data-testid="boundary-canvas"] canvas');
    if (!canvasEl) throw new Error("canvas not found");
    const stream = canvasEl.captureStream(60);
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((t) =>
      MediaRecorder.isTypeSupported(t)
    );
    if (!mimeType) throw new Error("no supported webm mimeType");
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    const stopped = new Promise((resolve) => {
      recorder.onstop = resolve;
    });
    recorder.start();
    await new Promise((resolve) => setTimeout(resolve, durationMs));
    recorder.stop();
    await stopped;
    const blob = new Blob(chunks, { type: mimeType });
    const buf = await blob.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }, RECORD_MS);

  const outPath = path.join(OUT_DIR, "boundary-hero-raw.webm");
  await import("node:fs/promises").then((fs) => fs.writeFile(outPath, Buffer.from(base64, "base64")));
  console.log(`Wrote ${outPath} (${(Buffer.from(base64, "base64").length / 1024 / 1024).toFixed(2)} MB)`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
