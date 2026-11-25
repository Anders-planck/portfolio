import { defineConfig, devices } from '@playwright/test'

// The e2e run needs a Convex backend. Locally and in CI it is the anonymous
// local backend (`CONVEX_AGENT_MODE=anonymous convex dev`), so no login is needed.
const convexUrl = process.env.VITE_CONVEX_URL ?? 'http://127.0.0.1:3210'
const PORT = '4173'

// The CMS tests sign in through the test-only sign-in (convex/e2e.ts), which
// works only on a loopback backend; these values are not secrets.
const e2eEnv = {
  E2E_OWNER_GITHUB_ID: '1000001',
  E2E_SIGN_IN_SECRET: 'local-e2e-sign-in-secret-loopback-only',
}

// The options `e2e/cms-test.ts` declares (config may not import e2e code).
export default defineConfig<{ convexUrl: string; testSignInSecret: string }>({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    convexUrl,
    testSignInSecret: e2eEnv.E2E_SIGN_IN_SECRET,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Sets the local backend's env (refuses any other deployment), then
      // `seed:publishSeedProfile` publishes the seed profile once.
      command:
        'bun scripts/e2e/prepare-local-convex.ts && bunx convex dev --tail-logs disable --run seed:publishSeedProfile',
      env: { CONVEX_AGENT_MODE: 'anonymous', ...e2eEnv },
      url: `${convexUrl}/version`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      // Production build served by workerd, the Cloudflare Workers runtime.
      command: `bun run build && bunx vite preview --port ${PORT} --strictPort`,
      env: { VITE_CONVEX_URL: convexUrl },
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
})
