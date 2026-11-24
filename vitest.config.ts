import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['convex/**/*.test.ts', 'src/**/*.test.{ts,tsx}'],
    // convex-test runs Convex functions in the edge runtime, like production.
    environment: 'edge-runtime',
    server: { deps: { inline: ['convex-test'] } },
  },
})
