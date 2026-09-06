import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // GitHub Actions' ubuntu-latest runner has no real GPU, so Chromium
    // falls back to SwiftShader software rendering — under /showcase's
    // sustained GPGPU particle-field compute shader, that software context
    // drops mid-test (a real `webglcontextlost` event, not a test bug),
    // which is what showcase.spec.ts's autoRotate-freeze test was hitting
    // on every CI run since 2026-08-19. These flags stabilize the software
    // WebGL path instead of leaving it to fail unpredictably. CI-only:
    // real GPUs (local dev, Vercel preview builds aren't tested this way)
    // don't need them.
    launchOptions: process.env.CI
      ? { args: ["--use-gl=swiftshader-webgl", "--enable-webgl", "--ignore-gpu-blocklist"] }
      : undefined,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] }, testMatch: /pages\.spec\.ts/ },
  ],
  // Only spin up a local server when no BASE_URL is given (i.e. not testing
  // against a live deployment like production or a Vercel preview).
  webServer: BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
