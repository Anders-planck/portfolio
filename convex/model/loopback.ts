/**
 * Where the test-only sign-in may run (`convex/e2e.ts`). Pure, so the guard
 * that keeps it off every cloud deployment is tested directly.
 */

const LOOPBACK_HOSTNAMES: readonly string[] = [
  '127.0.0.1',
  'localhost',
  '[::1]',
]

/**
 * True only for a local backend (`http://127.0.0.1:3210`): cloud deployments
 * are served over https from `*.convex.cloud` or a custom domain, never from
 * a loopback address.
 */
export function isLoopbackDeploymentUrl(deploymentUrl: string | undefined) {
  if (deploymentUrl === undefined || !URL.canParse(deploymentUrl)) {
    return false
  }
  const { protocol, hostname } = new URL(deploymentUrl)
  return protocol === 'http:' && LOOPBACK_HOSTNAMES.includes(hostname)
}
