import { v } from 'convex/values'

import { internalMutation, query } from './_generated/server'
import {
  appearanceProblemValidator,
  appearanceValidator,
  DEFAULT_APPEARANCE,
  findAppearanceProblems,
} from './model/appearance'

/**
 * The published theme and motion params the site renders with (ADR 0010),
 * or the defaults when nothing is published yet.
 */
export const getPublished = query({
  args: {},
  returns: appearanceValidator,
  handler: async (ctx) => {
    const row = await ctx.db.query('appearance').first()
    if (row === null) {
      return DEFAULT_APPEARANCE
    }
    return { theme: row.theme, motion: row.motion }
  },
})

/**
 * Publishes new params; open pages restyle at once. Params that break a rule
 * are a result the owner sees, not an error. Internal until the CMS and owner
 * auth exist (tickets 03 and 05); the e2e test calls it with `convex run`.
 */
export const publish = internalMutation({
  args: appearanceValidator,
  returns: v.union(
    v.object({ kind: v.literal('published') }),
    v.object({
      kind: v.literal('rejected'),
      problems: v.array(appearanceProblemValidator),
    }),
  ),
  handler: async (ctx, appearance) => {
    const problems = findAppearanceProblems(appearance)
    if (problems.length > 0) {
      return { kind: 'rejected' as const, problems }
    }
    const row = await ctx.db.query('appearance').first()
    if (row === null) {
      await ctx.db.insert('appearance', appearance)
    } else {
      await ctx.db.replace(row._id, appearance)
    }
    return { kind: 'published' as const }
  },
})

/** Withdraws the published params, so the site renders the defaults again. */
export const unpublish = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // The table holds one row; take() bounds the read regardless.
    const rows = await ctx.db.query('appearance').take(10)
    await Promise.all(rows.map((row) => ctx.db.delete(row._id)))
    return null
  },
})
