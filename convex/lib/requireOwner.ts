import type { MutationCtx, QueryCtx } from '../_generated/server'

/**
 * AUTH SEAM (ticket 04 · Convex Auth with GitHub, ADR 0005).
 *
 * Every CMS function calls this first. Until ticket 04 it checks nothing, so
 * the CMS functions are registered as `internal*` and cannot be called from a
 * client. Ticket 04 makes this throw unless the caller is the owner, then turns
 * the CMS functions in `content/store.ts` into public `mutation`s.
 */
export async function requireOwner(
  _ctx: QueryCtx | MutationCtx,
): Promise<void> {}
