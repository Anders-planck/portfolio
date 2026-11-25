import { internal } from '../../_generated/api'
import type { ActionCtx } from '../../_generated/server'
import { readSource } from './adapters'
import { isRefreshDue } from './status'

/**
 * Reads automated sources and records what they said. `due` is the daily
 * cron (`convex/crons.ts`), `all` is "Aggiorna ora" in Fonti. Sources are read
 * in parallel; one failing source never stops the others.
 */
export type RefreshScope = 'due' | 'all'

export async function refreshSources(
  ctx: ActionCtx,
  scope: RefreshScope,
  githubToken: string | null,
  now: number,
) {
  const targets = await ctx.runQuery(internal.metrics.listRefreshTargets, {})
  const selected = targets.filter(
    (target) =>
      scope === 'all' ||
      isRefreshDue(target.source, target.lastAttemptedAt, now),
  )
  await Promise.all(
    selected.map(async ({ metricId, source }) => {
      const reading = await readSource(source, githubToken)
      await ctx.runMutation(internal.metrics.recordSourceReading, {
        metricId,
        attemptedAt: now,
        reading,
      })
    }),
  )
}
