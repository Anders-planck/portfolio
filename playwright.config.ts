import { defineConfig, devices } from '@playwright/test'

// The e2e run needs a Convex backend. Locally and in CI it is the anonymous
// local backend (`CONVEX_AGENT_MODE=anonymous convex dev`), so no login is needed.
// E2E_CONVEX_PORT and E2E_APP_PORT move both servers, so runs from two
// worktrees at once do not collide; the defaults are Convex's and Vite's.
const CONVEX_PORT = Number(process.env.E2E_CONVEX_PORT ?? '3210')
const APP_PORT = process.env.E2E_APP_PORT ?? '4173'
const convexUrl =
  process.env.VITE_CONVEX_URL ?? `http://127.0.0.1:${String(CONVEX_PORT)}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: 'appearance.spec.ts',
    },
    {
      // Publishing an appearance changes every open page (colours included),
      // so it runs alone, after the specs that check pages, e.g. with axe.
      name: 'appearance',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'appearance.spec.ts',
      dependencies: ['chromium'],
    },
  ],
  webServer: [
    {
      // The site port (HTTP actions) sits next to the cloud port, as by default.
      // `seed:publishSeedProfile` publishes the seed profile once (a no-op afterwards).
      command: `bunx convex dev --tail-logs disable --local-cloud-port ${String(CONVEX_PORT)} --local-site-port ${String(CONVEX_PORT + 1)} --run seed:publishSeedProfile`,
      env: { CONVEX_AGENT_MODE: 'anonymous' },
      url: `${convexUrl}/version`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      // Production build served by workerd, the Cloudflare Workers runtime.
      command: `bun run build && bunx vite preview --port ${APP_PORT} --strictPort`,
      env: { VITE_CONVEX_URL: convexUrl },
      url: `http://localhost:${APP_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
})
