import { v } from 'convex/values'

import { query } from './_generated/server'

/**
 * Smoke-test query for the scaffold: proves the site renders Convex data on
 * the server. Replaced by real content queries from ticket 03 onwards.
 */
export const get = query({
  args: {},
  returns: v.object({ message: v.string() }),
  handler: () => ({ message: 'Ciao da Convex' }),
})
