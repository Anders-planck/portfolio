// Sets the Convex env of the LOCAL anonymous backend that dev and e2e use,
// before `convex dev` pushes (convex.config.ts requires the GitHub OAuth
// values, so a push without them fails). Never touches a cloud deployment:
// it refuses when .env.local points anywhere but an anonymous local backend.
//
//   bun scripts/e2e/prepare-local-convex.ts
//
// E2E_SIGN_IN_SECRET and E2E_OWNER_GITHUB_ID come from the caller
// (playwright.config.ts); the test-only sign-in (convex/e2e.ts) works only
// on a loopback backend, whatever its env says.

import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const LOCAL_DEPLOYMENT_PREFIX = 'anonymous:'

function readLinkedDeployment(): string | null {
  if (!existsSync('.env.local')) {
    return null
  }
  const line = readFileSync('.env.local', 'utf8')
    .split('\n')
    .find((entry) => entry.startsWith('CONVEX_DEPLOYMENT='))
  return line === undefined ? null : line.slice('CONVEX_DEPLOYMENT='.length)
}

function readRequiredEnv(name: string): string {
  const value = process.env[name]
  if (value === undefined || value === '') {
    throw new Error(`${name} must be set`)
  }
  return value
}

const deployment = readLinkedDeployment()
if (deployment !== null && !deployment.startsWith(LOCAL_DEPLOYMENT_PREFIX)) {
  throw new Error(
    `.env.local links ${deployment}, not an anonymous local backend: refusing to change its env.`,
  )
}

const localEnv = {
  // Placeholders: the local backend never talks to GitHub.
  AUTH_GITHUB_ID: 'local-placeholder',
  AUTH_GITHUB_SECRET: 'local-placeholder',
  OWNER_GITHUB_IDS: readRequiredEnv('E2E_OWNER_GITHUB_ID'),
  E2E_SIGN_IN_SECRET: readRequiredEnv('E2E_SIGN_IN_SECRET'),
}

const directory = mkdtempSync(join(tmpdir(), 'convex-local-env-'))
const envFile = join(directory, 'local.env')
try {
  writeFileSync(
    envFile,
    Object.entries(localEnv)
      .map(([name, value]) => `${name}=${value}`)
      .join('\n'),
  )
  execFileSync(
    'bunx',
    ['convex', 'env', 'set', '--force', '--from-file', envFile],
    {
      stdio: 'inherit',
      env: { ...process.env, CONVEX_AGENT_MODE: 'anonymous' },
    },
  )
} finally {
  rmSync(directory, { recursive: true, force: true })
}
