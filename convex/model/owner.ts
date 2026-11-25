/**
 * AUTH SEAM (ticket 04 · Convex Auth with GitHub, ADR 0005, issue #12).
 *
 * Every CMS function calls this first. Until ticket 04 it checks nothing, so
 * the CMS functions are registered as `internal*` and cannot be called from a
 * client. Ticket 04 gives it the function's `ctx`, makes it throw unless the
 * caller is the owner, and turns the CMS functions in `convex/content.ts` into
 * public `mutation`s.
 */
export async function requireOwner(): Promise<void> {
  // Intentionally empty until ticket 04 (#12): see the comment above.
}
