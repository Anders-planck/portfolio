// What `prepare-local-convex.ts` may do, decided from what it sees. Pure, so
// the guard that keeps it off every cloud deployment is tested directly.

/** `.env.local` of an anonymous local backend says `anonymous:<name>`. */
const LOCAL_DEPLOYMENT_PREFIX = 'anonymous:'

/** The only variables the Convex CLI child processes get (no deploy keys). */
const CHILD_ENV_NAMES = [
  'PATH',
  'HOME',
  'USER',
  'TMPDIR',
  'LANG',
  'SHELL',
  'BUN_INSTALL',
  'XDG_CACHE_HOME',
  'CI',
] as const

export interface LocalConvexSituation {
  /** `CONVEX_DEPLOY_KEY` in the environment (it targets a cloud deployment). */
  deployKey: string | undefined
  /** `CONVEX_DEPLOYMENT` in the environment, which the CLI prefers to `.env.local`. */
  environmentDeployment: string | undefined
  /** `CONVEX_DEPLOYMENT` in `.env.local`, null when the file or the line is missing. */
  linkedDeployment: string | null
}

export type LocalConvexStep =
  /** `.env.local` links an anonymous local backend: set its env. */
  | { kind: 'set-env' }
  /** Nothing is linked yet: create an anonymous local backend first. */
  | { kind: 'create-local-backend' }
  | { kind: 'refuse'; reason: string }

export function chooseLocalConvexStep(
  situation: LocalConvexSituation,
): LocalConvexStep {
  const { deployKey, environmentDeployment, linkedDeployment } = situation
  if (deployKey !== undefined && deployKey !== '') {
    return { kind: 'refuse', reason: 'CONVEX_DEPLOY_KEY is set' }
  }
  if (
    environmentDeployment !== undefined &&
    environmentDeployment !== '' &&
    !isLocalDeployment(environmentDeployment)
  ) {
    return {
      kind: 'refuse',
      reason: `CONVEX_DEPLOYMENT is ${environmentDeployment}`,
    }
  }
  if (linkedDeployment === null) {
    return { kind: 'create-local-backend' }
  }
  if (!isLocalDeployment(linkedDeployment)) {
    return {
      kind: 'refuse',
      reason: `.env.local links ${linkedDeployment}`,
    }
  }
  return { kind: 'set-env' }
}

export function isLocalDeployment(deployment: string) {
  return deployment.startsWith(LOCAL_DEPLOYMENT_PREFIX)
}

/**
 * The environment of the Convex CLI calls: a short allowlist plus anonymous
 * mode, so no deploy key or deployment of the caller's shell reaches them.
 */
export function toLocalCliEnvironment(
  environment: Record<string, string | undefined>,
): Record<string, string> {
  const passed = CHILD_ENV_NAMES.flatMap((name) => {
    const value = environment[name]
    return value === undefined ? [] : [[name, value] as const]
  })
  return { ...Object.fromEntries(passed), CONVEX_AGENT_MODE: 'anonymous' }
}

/** The `CONVEX_DEPLOYMENT` line of a `.env.local`, or null without one. */
export function readLinkedDeployment(envLocal: string | null): string | null {
  const line = envLocal
    ?.split('\n')
    .find((entry) => entry.startsWith('CONVEX_DEPLOYMENT='))
  if (line === undefined) {
    return null
  }
  const [value = ''] = line.slice('CONVEX_DEPLOYMENT='.length).split('#')
  const deployment = value.trim().replaceAll(/['"]/g, '')
  return deployment === '' ? null : deployment
}
