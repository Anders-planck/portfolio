import type { OauthFlowError } from '@convex-dev/auth/methods/github/react'
import { ConvexError } from 'convex/values'

/** Why the last GitHub sign-in did not let the owner in. */
export type AccessProblem = 'not-owner' | 'cancelled' | 'expired' | 'failed'

/**
 * Maps the error of the GitHub flow that just returned to the problem the
 * Accesso screen explains. The backend refuses an account off the allowlist
 * with a `ConvexError` of kind `not-owner` (`convex/model/owner.ts`).
 */
export function toAccessProblemFromFlowError(
  flowError: OauthFlowError | null,
): AccessProblem | null {
  if (flowError === null) {
    return null
  }
  switch (flowError.error) {
    case 'ACCESS_DENIED':
      return 'cancelled'
    case 'EXPIRED':
      return 'expired'
    case 'INVALID_FLOW':
      return 'failed'
    case 'OTHER_ERROR':
      return isNotOwnerRefusal(flowError.cause) ? 'not-owner' : 'failed'
  }
}

function isNotOwnerRefusal(cause: unknown) {
  if (!(cause instanceof ConvexError)) {
    return false
  }
  const data: unknown = cause.data
  return (
    typeof data === 'object' &&
    data !== null &&
    'kind' in data &&
    data.kind === 'not-owner'
  )
}
