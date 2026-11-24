import { convexQuery } from '@convex-dev/react-query'
import { queryOptions } from '@tanstack/react-query'
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from 'convex/server'

/**
 * React Query options for a live Convex query, usable by both
 * `ensureQueryData` (loader) and `useSuspenseQuery` (component).
 *
 * `convexQuery` declares `queryFn` and `staleTime` as possibly `undefined`,
 * which `exactOptionalPropertyTypes` (TS-02) rejects; at runtime it never sets
 * `queryFn` (the client's default `queryFn` runs). Only the defined keys are
 * passed on.
 */
export function convexQueryOptions<Query extends FunctionReference<'query'>>(
  query: Query,
  args: FunctionArgs<Query>,
) {
  const { queryKey, staleTime } = convexQuery(query, args)
  return queryOptions<
    FunctionReturnType<Query>,
    Error,
    FunctionReturnType<Query>,
    typeof queryKey
  >({ queryKey, ...(staleTime === undefined ? {} : { staleTime }) })
}
