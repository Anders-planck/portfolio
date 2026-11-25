import { v } from 'convex/values'

import { internalMutation } from './_generated/server'
import { publishSeedProfileOnce } from './model/content/seed'
import { seedMetricsOnce } from './model/metrics/seed'

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

/**
 * Creates the metrics listed in the Fonti mockup. Run with
 * `bunx convex run seed:seedMetrics`; it does nothing once any metric exists.
 */
export const seedMetrics = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await seedMetricsOnce(ctx, Date.now())
    return null
  },
})
