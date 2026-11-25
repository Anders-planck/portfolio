import { type Infer, v } from 'convex/values'

/**
 * Users of the CMS (ADR 0005). v1 has one role, the owner; the field is there
 * so roles can come later without a migration. Only GitHub accounts on the
 * `OWNER_GITHUB_IDS` allowlist ever get a row.
 */
export const userRoleValidator = v.literal('owner')

export const userFieldsValidator = v.object({
  /** GitHub's numeric user id, as a string: the allowlist matches on it. */
  githubId: v.string(),
  login: v.string(),
  name: v.string(),
  avatarUrl: v.optional(v.string()),
  role: userRoleValidator,
  createdAt: v.number(),
})

/** What a sign-in knows about the account, whichever method signed it in. */
export const ownerProfileValidator = v.object({
  githubId: v.string(),
  login: v.string(),
  name: v.string(),
  avatarUrl: v.optional(v.string()),
})
export type OwnerProfile = Infer<typeof ownerProfileValidator>

/** Who is calling, as the CMS shell shows it. */
export const viewerValidator = v.union(
  v.object({ status: v.literal('signed-out') }),
  /** Signed in, but the account is no longer on the allowlist. */
  v.object({ status: v.literal('not-owner') }),
  v.object({
    status: v.literal('owner'),
    login: v.string(),
    name: v.string(),
  }),
)
export type Viewer = Infer<typeof viewerValidator>

/** Why a CMS call or a sign-in was refused; the client reads `kind`. */
export type AccessRefusal = { kind: 'signed-out' } | { kind: 'not-owner' }

/**
 * The allowlist decides, on every check: removing an id locks that account
 * out at once. (`role` has one value in v1, so it adds nothing to check yet.)
 */
export function isAllowlistedGithubId(
  githubId: string,
  ownerGithubIds: readonly string[],
) {
  return ownerGithubIds.includes(githubId)
}
