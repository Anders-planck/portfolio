// Prepares the LOCAL anonymous Convex backend that e2e (and `bun run dev`
// without a cloud deployment) use, before `convex dev` pushes:
// convex.config.ts requires the GitHub OAuth values, so a push without them
// fails. It never touches a cloud deployment (`local-convex-target.ts`):
//
//   bun scripts/local-convex/prepare-local-convex.ts            # e2e: refuses a cloud target
//   bun scripts/local-convex/prepare-local-convex.ts --for-dev  # dev: leaves a cloud target alone
//
// Optional env: E2E_CONVEX_PORT (the port `convex dev` will use),
// E2E_OWNER_GITHUB_ID and E2E_SIGN_IN_SECRET (the test-only sign-in,
// convex/e2e.ts, which works only on a loopback backend whatever its env says),
// E2E_FAKE_R2_ORIGIN (media on the fake R2 server, scripts/fake-r2).

import { execFileSync, spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { toFakeR2Env } from '../fake-r2/fake-r2-settings'
import {
  chooseLocalConvexStep,
  type LocalConvexStep,
  readLinkedDeployment,
  toLocalCliEnvironment,
} from './local-convex-target'

const ENV_LOCAL_FILE = '.env.local'
const LOCAL_STATE_FILE = '.convex/local/default/config.json'
const isForDev = process.argv.includes('--for-dev')
const cliEnvironment = toLocalCliEnvironment(process.env)
const cloudPort =
  process.env.E2E_CONVEX_PORT === undefined
    ? null
    : Number(process.env.E2E_CONVEX_PORT)

function readStep(): LocalConvexStep {
  return chooseLocalConvexStep({
    deployKey: process.env.CONVEX_DEPLOY_KEY,
    environmentDeployment: process.env.CONVEX_DEPLOYMENT,
    linkedDeployment: readLinkedDeployment(
      existsSync(ENV_LOCAL_FILE) ? readFileSync(ENV_LOCAL_FILE, 'utf8') : null,
    ),
  })
}

function toPortArguments(): string[] {
  return cloudPort === null
    ? []
    : [
        '--local-cloud-port',
        String(cloudPort),
        '--local-site-port',
        String(cloudPort + 1),
      ]
}

// `convex dev --once` in anonymous mode creates the local backend and links it
// in .env.local before it pushes; that first push fails (the env is not set
// yet), which is expected: the link is checked right after.
function createLocalBackend() {
  spawnSync(
    'bunx',
    [
      'convex',
      'dev',
      '--once',
      '--typecheck',
      'disable',
      '--codegen',
      'disable',
      ...toPortArguments(),
    ],
    { stdio: 'inherit', env: cliEnvironment },
  )
}

// `convex env set` starts the local backend on the ports its state file
// remembers and has no port flag; point it at the port `convex dev` will use,
// so it never meets another worktree's backend.
function alignLocalStatePorts() {
  if (cloudPort === null || !existsSync(LOCAL_STATE_FILE)) {
    return
  }
  const state: unknown = JSON.parse(readFileSync(LOCAL_STATE_FILE, 'utf8'))
  if (typeof state !== 'object' || state === null || !('ports' in state)) {
    throw new Error(`${LOCAL_STATE_FILE} has no ports`)
  }
  writeFileSync(
    LOCAL_STATE_FILE,
    JSON.stringify({
      ...state,
      ports: { cloud: cloudPort, site: cloudPort + 1 },
    }),
  )
}

function toLocalEnv(): Record<string, string> {
  const { E2E_OWNER_GITHUB_ID, E2E_SIGN_IN_SECRET, E2E_FAKE_R2_ORIGIN } =
    process.env
  return {
    // Placeholders: the local backend never talks to GitHub.
    AUTH_GITHUB_ID: 'local-placeholder',
    AUTH_GITHUB_SECRET: 'local-placeholder',
    ...(E2E_OWNER_GITHUB_ID === undefined
      ? {}
      : { OWNER_GITHUB_IDS: E2E_OWNER_GITHUB_ID }),
    ...(E2E_SIGN_IN_SECRET === undefined ? {} : { E2E_SIGN_IN_SECRET }),
    // Media on the fake R2 server (scripts/fake-r2), never a real bucket.
    ...(E2E_FAKE_R2_ORIGIN === undefined
      ? {}
      : toFakeR2Env(E2E_FAKE_R2_ORIGIN)),
  }
}

function setLocalEnv(localEnv: Record<string, string>) {
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
      { stdio: 'inherit', env: cliEnvironment },
    )
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

let step = readStep()
if (step.kind === 'refuse' && isForDev) {
  process.stdout.write(
    `Not a local Convex backend (${step.reason}): nothing to prepare.\n`,
  )
  process.exit(0)
}
if (step.kind === 'create-local-backend') {
  createLocalBackend()
  step = readStep()
}
if (step.kind !== 'set-env') {
  throw new Error(
    step.kind === 'refuse'
      ? `Refusing to change a Convex deployment that is not local: ${step.reason}.`
      : 'Could not create a local Convex backend.',
  )
}
alignLocalStatePorts()
setLocalEnv(toLocalEnv())
