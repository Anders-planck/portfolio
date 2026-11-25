import { type Infer, v } from 'convex/values'

import type { MutationCtx } from '../../_generated/server'
import {
  definitionProblemValidator,
  findDefinitionProblems,
  findManualCountProblems,
  type ManualCount,
  manualCountProblemValidator,
} from './checks'
import { findMetricByKey, readLatestReading } from './readings'
import type { MetricDefinition } from './tables'

/**
 * What the owner writes in Fonti: a new metric, a manual count. Both are
 * idempotent: repeating the same request (a double click) changes nothing.
 */

export const createOutcomeValidator = v.union(
  v.object({ kind: v.literal('created') }),
  v.object({
    kind: v.literal('rejected'),
    problems: v.array(definitionProblemValidator),
  }),
)
export type CreateOutcome = Infer<typeof createOutcomeValidator>

export const manualCountOutcomeValidator = v.union(
  v.object({ kind: v.literal('recorded') }),
  v.object({
    kind: v.literal('rejected'),
    problems: v.array(manualCountProblemValidator),
  }),
)
export type ManualCountOutcome = Infer<typeof manualCountOutcomeValidator>

function isSameDefinition(left: MetricDefinition, right: MetricDefinition) {
  const pick = ({ key, label, format, source }: MetricDefinition) =>
    JSON.stringify({ key, label, format, source })
  return pick(left) === pick(right)
}

export async function addMetric(
  ctx: MutationCtx,
  definition: MetricDefinition,
  now: number,
): Promise<CreateOutcome> {
  const problems = findDefinitionProblems(definition)
  if (problems.length > 0) {
    return { kind: 'rejected', problems }
  }
  const existing = await findMetricByKey(ctx, definition.key)
  if (existing !== null) {
    return isSameDefinition(existing, definition)
      ? { kind: 'created' }
      : { kind: 'rejected', problems: [{ kind: 'key-taken' }] }
  }
  await ctx.db.insert('metrics', {
    ...definition,
    lastAttempt: null,
    createdAt: now,
  })
  return { kind: 'created' }
}

export async function addManualCount(
  ctx: MutationCtx,
  { key, ...count }: ManualCount & { key: string },
  now: number,
): Promise<ManualCountOutcome> {
  const metric = await findMetricByKey(ctx, key)
  if (metric === null) {
    return { kind: 'rejected', problems: [{ kind: 'unknown-metric' }] }
  }
  if (metric.source.kind !== 'manual') {
    return { kind: 'rejected', problems: [{ kind: 'not-manual' }] }
  }
  const problems = findManualCountProblems(count, now)
  if (problems.length > 0) {
    return { kind: 'rejected', problems }
  }
  const evidence = count.evidence.trim()
  const latest = await readLatestReading(ctx, metric._id)
  const isRepeat =
    latest?.value === count.value &&
    latest.verifiedAt === count.countedAt &&
    latest.evidence === evidence
  if (!isRepeat) {
    await ctx.db.insert('metricReadings', {
      metricId: metric._id,
      value: count.value,
      total: null,
      verifiedAt: count.countedAt,
      evidence,
      recordedAt: now,
    })
  }
  return { kind: 'recorded' }
}
