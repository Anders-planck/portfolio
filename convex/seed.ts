import { v } from 'convex/values'

import { internalMutation } from './_generated/server'
import { publishSeedProfileOnce } from './model/content/seed'

/**
 * Publishes the seed profile. Run with `bunx convex run seed:publishSeedProfile`;
 * it does nothing once a profile has been published, so retries are safe.
 */
export const publishSeedProfile = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await publishSeedProfileOnce(ctx, Date.now())
    return null
  },
})
