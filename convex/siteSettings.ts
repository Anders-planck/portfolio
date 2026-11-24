import { ConvexError, v } from 'convex/values'
import { portfolioTheme } from '../themes/portfolio/portfolio.theme'
import { internalMutation, query } from './_generated/server'
import {
  appearanceProblems,
  appearanceValidator,
  defaultAppearance,
} from './lib/appearance'
import { appearanceCss } from './lib/appearanceCss'

/**
 * The published theme and motion params the site renders with (ADR 0010),
 * or the defaults when nothing is published yet, with the CSS they make on
 * top of the portfolio theme. The theme comes from its source (the input
 * `astryx theme build` reads), since Convex cannot load the built module's
 * stylesheet. Convex caches the result until the next publish, so the CSS is
 * generated once per change.
 */
export const getAppearance = query({
  args: {},
  returns: v.object({ appearance: appearanceValidator, css: v.string() }),
  handler: async (ctx) => {
    const row = await ctx.db.query('siteSettings').first()
    const appearance =
      row === null
        ? defaultAppearance
        : { theme: row.theme, motion: row.motion }
    return { appearance, css: appearanceCss(portfolioTheme, appearance) }
  },
})

/**
 * Replaces the published params. Internal until the CMS and owner auth
 * exist (tickets 03 and 05); the e2e test calls it with `convex run`.
 */
export const setAppearance = internalMutation({
  args: appearanceValidator,
  returns: v.null(),
  handler: async (ctx, appearance) => {
    const problems = appearanceProblems(appearance)
    if (problems.length > 0) {
      throw new ConvexError(problems.join('; '))
    }
    const row = await ctx.db.query('siteSettings').first()
    if (row === null) {
      await ctx.db.insert('siteSettings', appearance)
    } else {
      await ctx.db.replace(row._id, appearance)
    }
    return null
  },
})

/** Removes the published params, so the site falls back to the defaults. */
export const resetAppearance = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // The table holds one row; take(10) bounds the read regardless.
    for (const row of await ctx.db.query('siteSettings').take(10)) {
      await ctx.db.delete(row._id)
    }
    return null
  },
})
