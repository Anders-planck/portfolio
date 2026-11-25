import { defineConfig, devices } from '@playwright/test'

// The e2e run needs a Convex backend. Locally and in CI it is the anonymous
// local backend (`CONVEX_AGENT_MODE=anonymous convex dev`), so no login is needed.
// E2E_CONVEX_PORT and E2E_APP_PORT move both servers, so runs from two
// worktrees at once do not collide; the defaults are Convex's and Vite's.
const CONVEX_PORT = Number(process.env.E2E_CONVEX_PORT ?? '3210')
const APP_PORT = process.env.E2E_APP_PORT ?? '4173'
// The fake R2 server (scripts/fake-r2) sits after the backend's site port.
const FAKE_R2_PORT = CONVEX_PORT + 2
const fakeR2Origin = `http://127.0.0.1:${String(FAKE_R2_PORT)}`
const convexUrl =
  process.env.VITE_CONVEX_URL ?? `http://127.0.0.1:${String(CONVEX_PORT)}`

// The CMS tests sign in through the test-only sign-in (convex/e2e.ts), which
// works only on a loopback backend; these values are not secrets.
const e2eEnv = {
  E2E_CONVEX_PORT: String(CONVEX_PORT),
  E2E_OWNER_GITHUB_ID: '1000001',
  E2E_SIGN_IN_SECRET: 'local-e2e-sign-in-secret-loopback-only',
  E2E_FAKE_R2_ORIGIN: fakeR2Origin,
}

// The options `e2e/cms-test.ts` declares (config may not import e2e code).
export default defineConfig<{ convexUrl: string; testSignInSecret: string }>({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: 'on-first-retry',
    convexUrl,
    testSignInSecret: e2eEnv.E2E_SIGN_IN_SECRET,
  },
  projects: [
    {
      // Uploads a CV and publishes the Profile with it, so the header's CV
      // button (magnetic in motion.spec.ts) exists for the other specs.
      name: 'media',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'cms-media.spec.ts',
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['appearance.spec.ts', 'cms-media.spec.ts'],
      dependencies: ['media'],
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
      // Before the backend: its media env points here.
      command: `bun scripts/fake-r2/fake-r2-server.ts ${String(FAKE_R2_PORT)}`,
      url: `${fakeR2Origin}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      // First the local backend's env (convex.config.ts needs it to push;
      // the script refuses any other deployment). The site port (HTTP
      // actions) sits next to the cloud port, as by default.
      // `seed:publishSeedProfile` publishes the seed profile once (a no-op afterwards).
      command: `bun scripts/local-convex/prepare-local-convex.ts && bunx convex dev --tail-logs disable --local-cloud-port ${String(CONVEX_PORT)} --local-site-port ${String(CONVEX_PORT + 1)} --run seed:publishSeedProfile`,
      env: { CONVEX_AGENT_MODE: 'anonymous', ...e2eEnv },
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
