import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { api, internal } from './_generated/api'
import { toJsonResponse } from './model/metrics/http.fixture'
import { MANUAL_READING_TTL_MS } from './model/metrics/status'
import { createOwnerBackend, type SignedInBackend } from './owner.fixture'

const NOW = Date.UTC(2026, 10, 25, 6)
const DAY_MS = 24 * 60 * 60 * 1000
const NPM_URL = 'https://api.npmjs.org/downloads/point/last-year/some-package'

type Backend = SignedInBackend

/** Answers each URL with its route; anything else is a lost connection. */
function stubFetchRoutes(routes: Record<string, () => Response>) {
  const fetchMock = vi.fn((url: string) => {
    const route = routes[url]
    return route === undefined
      ? Promise.reject(new TypeError('fetch failed'))
      : Promise.resolve(route())
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function createNpmMetric(
  backend: Backend,
  cadence: 'daily' | 'weekly' = 'daily',
) {
  return backend.mutation(api.metrics.createMetric, {
    key: 'downloads',
    label: 'download/anno',
    format: 'count',
    source: { kind: 'npm', packageName: 'some-package', cadence },
  })
}

function createManualMetric(backend: Backend) {
  return backend.mutation(api.metrics.createMetric, {
    key: 'test-files',
    label: 'file di test',
    format: 'at-least',
    source: { kind: 'manual' },
  })
}

async function readMetricRow(backend: Backend, key: string) {
  const overview = await backend.query(api.metrics.getSourcesOverview, {})
  return overview.metrics.find((metric) => metric.key === key)
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

test('a refresh records the figure and Fonti shows it formatted, with its date', async () => {
  const backend = await createOwnerBackend()
  await createNpmMetric(backend)
  stubFetchRoutes({ [NPM_URL]: () => toJsonResponse({ downloads: 8489 }) })

  await backend.action(api.metrics.refreshNow, {})

  expect(await readMetricRow(backend, 'downloads')).toMatchObject({
    display: '8.489',
    verifiedAt: NOW,
    status: { kind: 'ok' },
  })
})

test('a failed refresh keeps the last verified figure and its date, never zero', async () => {
  const backend = await createOwnerBackend()
  await createNpmMetric(backend)
  stubFetchRoutes({ [NPM_URL]: () => toJsonResponse({ downloads: 8489 }) })
  await backend.action(api.metrics.refreshNow, {})

  vi.setSystemTime(NOW + DAY_MS)
  stubFetchRoutes({ [NPM_URL]: () => toJsonResponse({ error: 'down' }, 503) })
  await backend.action(api.metrics.refreshNow, {})

  expect(await readMetricRow(backend, 'downloads')).toMatchObject({
    display: '8.489',
    verifiedAt: NOW,
    status: {
      kind: 'failing',
      failedAt: NOW + DAY_MS,
      reason: { kind: 'http', status: 503 },
    },
  })
})

test('a source that never answered has no figure to show', async () => {
  const backend = await createOwnerBackend()
  await createNpmMetric(backend)
  stubFetchRoutes({})

  await backend.action(api.metrics.refreshNow, {})

  expect(await readMetricRow(backend, 'downloads')).toMatchObject({
    display: null,
    verifiedAt: null,
    status: { kind: 'failing', reason: { kind: 'network' } },
  })
})

test('the scheduled refresh reads only the sources that are due', async () => {
  const backend = await createOwnerBackend()
  await createNpmMetric(backend, 'weekly')
  const fetchMock = stubFetchRoutes({
    [NPM_URL]: () => toJsonResponse({ downloads: 10 }),
  })

  await backend.action(internal.metrics.refreshDueSources, {})
  vi.setSystemTime(NOW + DAY_MS)
  await backend.action(internal.metrics.refreshDueSources, {})
  vi.setSystemTime(NOW + 7 * DAY_MS)
  await backend.action(internal.metrics.refreshDueSources, {})

  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test('a weekly source that failed is read again on the next daily run', async () => {
  const backend = await createOwnerBackend()
  await createNpmMetric(backend, 'weekly')
  const fetchMock = stubFetchRoutes({
    [NPM_URL]: () => toJsonResponse({ error: 'down' }, 503),
  })

  await backend.action(internal.metrics.refreshDueSources, {})
  vi.setSystemTime(NOW + DAY_MS)
  await backend.action(internal.metrics.refreshDueSources, {})

  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test('reading the sources twice in a row records one reading', async () => {
  const backend = await createOwnerBackend()
  await createNpmMetric(backend)
  stubFetchRoutes({ [NPM_URL]: () => toJsonResponse({ downloads: 8489 }) })

  await backend.action(api.metrics.refreshNow, {})
  vi.setSystemTime(NOW + 60 * 1000)
  await backend.action(api.metrics.refreshNow, {})

  const readings = await backend.run((ctx) =>
    ctx.db.query('metricReadings').take(10),
  )
  expect(readings).toHaveLength(1)
})

test('a private source is not read without the GitHub token', async () => {
  const backend = await createOwnerBackend()
  vi.stubEnv('GITHUB_TOKEN', '')
  await backend.mutation(api.metrics.createMetric, {
    key: 'merged-prs',
    label: 'PR mergiati',
    format: 'count',
    source: {
      kind: 'github-search',
      query: 'is:pr is:merged author:Anders-planck',
      needsToken: true,
      cadence: 'daily',
    },
  })
  const fetchMock = stubFetchRoutes({})

  await backend.action(api.metrics.refreshNow, {})

  expect(fetchMock).not.toHaveBeenCalled()
  expect(await readMetricRow(backend, 'merged-prs')).toMatchObject({
    status: { kind: 'failing', reason: { kind: 'missing-token' } },
  })
  const overview = await backend.query(api.metrics.getSourcesOverview, {})
  expect(overview.isGithubTokenSet).toBe(false)
})

test('a manual count needs evidence', async () => {
  const backend = await createOwnerBackend()
  await createManualMetric(backend)

  const outcome = await backend.mutation(api.metrics.recordManualCount, {
    key: 'test-files',
    value: 750,
    countedAt: NOW,
    evidence: '',
  })

  expect(outcome).toEqual({
    kind: 'rejected',
    problems: [{ kind: 'missing-evidence' }],
  })
  expect(await readMetricRow(backend, 'test-files')).toMatchObject({
    display: null,
    status: { kind: 'awaiting-reading' },
  })
})

test('a manual count is shown with its evidence and expires after ninety days', async () => {
  const backend = await createOwnerBackend()
  await createManualMetric(backend)
  const countedAt = NOW - DAY_MS

  await backend.mutation(api.metrics.recordManualCount, {
    key: 'test-files',
    value: 750,
    countedAt,
    evidence: 'Conteggio a mano',
  })

  expect(await readMetricRow(backend, 'test-files')).toMatchObject({
    display: '750+',
    verifiedAt: countedAt,
    evidence: 'Conteggio a mano',
    status: { kind: 'ok' },
  })
  vi.setSystemTime(countedAt + MANUAL_READING_TTL_MS)
  expect(await readMetricRow(backend, 'test-files')).toMatchObject({
    display: '750+',
    status: { kind: 'expired', expiredAt: countedAt + MANUAL_READING_TTL_MS },
  })
})

test('recording the same manual count twice keeps one reading', async () => {
  const backend = await createOwnerBackend()
  await createManualMetric(backend)
  const count = {
    key: 'test-files',
    value: 750,
    countedAt: NOW,
    evidence: 'Conteggio a mano',
  }

  await backend.mutation(api.metrics.recordManualCount, count)
  await backend.mutation(api.metrics.recordManualCount, count)

  const readings = await backend.run((ctx) =>
    ctx.db.query('metricReadings').take(10),
  )
  expect(readings).toHaveLength(1)
})

test('a manual count is refused for an automated metric', async () => {
  const backend = await createOwnerBackend()
  await createNpmMetric(backend)

  const outcome = await backend.mutation(api.metrics.recordManualCount, {
    key: 'downloads',
    value: 1,
    countedAt: NOW,
    evidence: 'a mano',
  })

  expect(outcome).toEqual({
    kind: 'rejected',
    problems: [{ kind: 'not-manual' }],
  })
})

test('a key is used once; repeating the same definition is not an error', async () => {
  const backend = await createOwnerBackend()

  expect(await createNpmMetric(backend)).toEqual({ kind: 'created' })
  expect(await createNpmMetric(backend)).toEqual({ kind: 'created' })
  expect(await createNpmMetric(backend, 'weekly')).toEqual({
    kind: 'rejected',
    problems: [{ kind: 'key-taken' }],
  })
})

test('a repeated definition is the same whatever order its fields come in', async () => {
  const backend = await createOwnerBackend()
  await createNpmMetric(backend)

  const repeated = await backend.mutation(api.metrics.createMetric, {
    source: { cadence: 'daily', packageName: 'some-package', kind: 'npm' },
    format: 'count',
    label: 'download/anno',
    key: 'downloads',
  })

  expect(repeated).toEqual({ kind: 'created' })
})

test('the rounding choice changes how large figures are shown', async () => {
  const backend = await createOwnerBackend()
  await createNpmMetric(backend)
  stubFetchRoutes({ [NPM_URL]: () => toJsonResponse({ downloads: 25_300 }) })
  await backend.action(api.metrics.refreshNow, {})

  expect(await readMetricRow(backend, 'downloads')).toMatchObject({
    display: '25k+',
  })
  await backend.mutation(api.metrics.chooseLargeNumberStyle, {
    largeNumberStyle: 'exact',
  })
  expect(await readMetricRow(backend, 'downloads')).toMatchObject({
    display: '25.300',
  })
})

async function publishSubtitle(backend: Backend, subtitle: string) {
  const { revision } = await backend.mutation(api.content.saveDraft, {
    collection: 'profile',
    key: 'main',
    localeEdit: { locale: 'it', content: { subtitle } },
  })
  return backend.mutation(api.content.publish, {
    selection: [{ collection: 'profile', key: 'main', revision }],
    note: 'Sottotitolo',
    requestId: `publish:${subtitle}`,
  })
}

test('copy can be published only with references to metrics that exist', async () => {
  const backend = await createOwnerBackend()
  await createNpmMetric(backend)

  expect(
    await publishSubtitle(backend, '{{m:missing}} download'),
  ).toMatchObject({ status: 'blocked', findings: [{ rule: 'unknown-metric' }] })
  expect(
    await publishSubtitle(backend, '{{m:downloads}} download'),
  ).toMatchObject({ status: 'published' })
})
