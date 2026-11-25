import type { Infer } from 'convex/values'

import type { MutationCtx } from '../../_generated/server'
import { addManualCount, addMetric } from './definitions'
import type { metricDefinitionValidator } from './tables'

/**
 * Seed metrics: only the sources listed in the `cms-fonti` mockup (PLAN →
 * Seed content), with the mockup's packages, repositories and manual count.
 * Automated figures are not seeded: the first refresh reads them.
 *
 * Two mockup rows are not seeded because the mockup does not name their
 * query: "PR mergiati in Madisoft" (search: author + org, which org) and
 * "commit miei in LECO" (which private repositories). The owner adds them in
 * Fonti.
 *
 * "a ogni build" in the mockup becomes `daily`: content goes live without a
 * build, so the daily cron is the closest refresh.
 */

type MetricDefinition = Infer<typeof metricDefinitionValidator>

const OWNER_GITHUB_LOGIN = 'Anders-planck'

const SEED_METRICS: readonly MetricDefinition[] = [
  {
    key: 'sdk-downloads',
    label: 'download/anno SDK e-receipts',
    format: 'count',
    source: {
      kind: 'npm',
      packageName: '@a-cube-io/ereceipts-js-sdk',
      cadence: 'daily',
    },
  },
  {
    key: 'expo-mtls-downloads',
    label: 'download/anno expo-mutual-tls',
    format: 'count',
    source: {
      kind: 'npm',
      packageName: '@a-cube-io/expo-mutual-tls',
      cadence: 'daily',
    },
  },
  {
    key: 'sdk-commits',
    label: 'commit miei nell’SDK',
    format: 'count-of-total',
    source: {
      kind: 'github-commits',
      repos: ['a-cube-io/ereceipts-js-sdk'],
      login: OWNER_GITHUB_LOGIN,
      needsToken: false,
      cadence: 'daily',
    },
  },
  {
    key: 'expo-mtls-commits',
    label: 'commit miei in expo-mutual-tls',
    format: 'count-of-total',
    source: {
      kind: 'github-commits',
      repos: ['a-cube-io/expo-mutual-tls'],
      login: OWNER_GITHUB_LOGIN,
      needsToken: false,
      cadence: 'daily',
    },
  },
  {
    key: 'leco-test-files',
    label: 'file di test in LECO',
    format: 'at-least',
    source: { kind: 'manual' },
  },
]

/** The mockup's manual count: 750+ test files, counted by hand on 23 Nov 2026. */
const LECO_TEST_FILES_COUNT = {
  key: 'leco-test-files',
  value: 750,
  countedAt: Date.UTC(2026, 10, 23),
  evidence: 'Conteggio a mano',
}

/**
 * Creates the seed metrics and the manual count, unless any metric exists
 * (so retries are safe and the owner's edits are never overwritten).
 */
export async function seedMetricsOnce(ctx: MutationCtx, now: number) {
  if ((await ctx.db.query('metrics').first()) !== null) {
    return
  }
  for (const definition of SEED_METRICS) {
    const outcome = await addMetric(ctx, definition, now)
    if (outcome.kind === 'rejected') {
      throw new Error(`Seed metric ${definition.key} was rejected`)
    }
  }
  const counted = await addManualCount(ctx, LECO_TEST_FILES_COUNT, now)
  if (counted.kind === 'rejected') {
    throw new Error('The seed manual count was rejected')
  }
}
