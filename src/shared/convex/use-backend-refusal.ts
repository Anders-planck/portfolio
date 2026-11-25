import { ConvexError, type Value } from 'convex/values'
import { useState } from 'react'

/**
 * For async event handlers that call the backend. A refusal (a `ConvexError`,
 * e.g. signed out or no longer the owner) is not a failure the form can show
 * or retry (DATA-03): it is thrown again while rendering, so the route's
 * error boundary handles it instead of an unhandled rejection. Returns
 * `takeRefusal(error)`, true when the error was a refusal and is taken.
 */
export function useBackendRefusal() {
  const [refusal, setRefusal] = useState<ConvexError<Value> | null>(null)
  if (refusal !== null) {
    throw refusal
  }
  return (error: unknown) => {
    if (!(error instanceof ConvexError)) {
      return false
    }
    setRefusal(error)
    return true
  }
}
