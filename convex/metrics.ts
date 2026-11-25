import { v } from 'convex/values'

import {
  internalAction,
  internalMutation,
  internalQuery,
} from './_generated/server'
import { readGithubToken } from './model/env'
import {
  attemptValidator,
  sourceReadingValidator,
} from './model/metrics/attempts'
import {
  addManualCount,
  addMetric,
  createOutcomeValidator,
  manualCountOutcomeValidator,
} from './model/metrics/definitions'
import { largeNumberStyleValidator } from './model/metrics/format'
import {
  readSourcesOverview,
  sourcesOverviewValidator,
} from './model/metrics/overview'
import { recordReading, saveLargeNumberStyle } from './model/metrics/readings'
import { refreshSources } from './model/metrics/refresh'
import { metricDefinitionValidator } from './model/metrics/tables'
import {
  listAutomatedMetrics,
  refreshTargetValidator,
} from './model/metrics/targets'
import { requireOwner } from './model/owner'

/**
 * Metrics (ADR 0004). The CMS functions (Fonti) are internal until owner auth
 * exists (ticket 04, see `model/owner.ts`); the refresh runs from the cron.
 */

/** Fonti: every metric with its last verified figure, date and status. */
export const getSourcesOverview = internalQuery({
  args: {},
  returns: sourcesOverviewValidator,
  handler: async (ctx) => {
    await requireOwner()
    return readSourcesOverview(ctx, readGithubToken() !== null, Date.now())
  },
})

/** Fonti "Nuova fonte". Repeating the same definition is not an error. */
export const createMetric = internalMutation({
  args: metricDefinitionValidator,
  returns: createOutcomeValidator,
  handler: async (ctx, definition) => {
    await requireOwner()
    return addMetric(ctx, definition, Date.now())
  },
})

/** Records a manual count with its evidence; `countedAt` is the day of the count. */
export const recordManualCount = internalMutation({
  args: {
    key: v.string(),
    value: v.number(),
    countedAt: v.number(),
    evidence: v.string(),
  },
  returns: manualCountOutcomeValidator,
  handler: async (ctx, count) => {
    await requireOwner()
    return addManualCount(ctx, count, Date.now())
  },
})

/** Fonti "Arrotondamenti": exact figures, or «10k+» above ten thousand. */
export const chooseLargeNumberStyle = internalMutation({
  args: { largeNumberStyle: largeNumberStyleValidator },
  returns: v.null(),
  handler: async (ctx, { largeNumberStyle }) => {
    await requireOwner()
    await saveLargeNumberStyle(ctx, largeNumberStyle)
    return null
  },
})

/** Fonti "Aggiorna ora": reads every automated source now. */
export const refreshNow = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requireOwner()
    await refreshSources(ctx, 'all', readGithubToken(), Date.now())
    return null
  },
})

/** The daily cron: reads the sources whose cadence makes them due. */
export const refreshDueSources = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await refreshSources(ctx, 'due', readGithubToken(), Date.now())
    return null
  },
})

export const listRefreshTargets = internalQuery({
  args: {},
  returns: v.array(refreshTargetValidator),
  handler: (ctx) => listAutomatedMetrics(ctx),
})

export const recordSourceReading = internalMutation({
  args: {
    metricId: v.id('metrics'),
    attemptedAt: attemptValidator.fields.attemptedAt,
    reading: sourceReadingValidator,
  },
  returns: v.null(),
  handler: async (ctx, { metricId, attemptedAt, reading }) => {
    await recordReading(ctx, metricId, attemptedAt, reading)
    return null
  },
})
