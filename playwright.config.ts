import { defineConfig, devices } from '@playwright/test'

// The e2e run needs a Convex backend. Locally and in CI it is the anonymous
// local backend (`CONVEX_AGENT_MODE=anonymous convex dev`), so no login is needed.
const convexUrl = process.env.VITE_CONVEX_URL ?? 'http://127.0.0.1:3210'
const port = 4173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // `seed:profile` publishes the seed profile once (a no-op afterwards).
      command: 'bunx convex dev --tail-logs disable --run seed:profile',
      env: { CONVEX_AGENT_MODE: 'anonymous' },
      url: `${convexUrl}/version`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      // Production build served by workerd, the Cloudflare Workers runtime.
      command: `bun run build && bunx vite preview --port ${port} --strictPort`,
      env: { VITE_CONVEX_URL: convexUrl },
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
})
