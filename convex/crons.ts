import { cronJobs } from 'convex/server'

import { internal } from './_generated/api'

const crons = cronJobs()

// Metric sources (ADR 0004): once a day; weekly sources skip until due.
crons.daily(
  'refresh metric sources',
  { hourUTC: 4, minuteUTC: 0 },
  internal.metrics.refreshDueSources,
  {},
)

export default crons
