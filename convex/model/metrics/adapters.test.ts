import { afterEach, expect, test, vi } from 'vitest'

import { readSource } from './adapters'

const TOKEN = 'test-github-token'
const DAILY = 'daily'

type FetchCall = [url: string, init?: RequestInit | undefined]

function stubFetch(...responses: (Response | Error)[]) {
  const fetchMock =
    vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()
  responses.forEach((response) => {
    if (response instanceof Error) {
      fetchMock.mockRejectedValueOnce(response)
    } else {
      fetchMock.mockResolvedValueOnce(response)
    }
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function toJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function toHeaders(call: FetchCall | undefined) {
  return new Headers(call?.[1]?.headers)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

test('npm reads the downloads of the last year', async () => {
  const fetchMock = stubFetch(
    toJsonResponse({
      downloads: 8489,
      start: '2025-11-25',
      end: '2026-11-24',
      package: '@a-cube-io/ereceipts-js-sdk',
    }),
  )

  const reading = await readSource(
    { kind: 'npm', packageName: '@a-cube-io/ereceipts-js-sdk', cadence: DAILY },
    null,
  )

  expect(reading).toEqual({
    kind: 'ok',
    figure: { value: 8489, total: null },
  })
  expect(fetchMock.mock.calls[0]?.[0]).toBe(
    'https://api.npmjs.org/downloads/point/last-year/@a-cube-io/ereceipts-js-sdk',
  )
})

test('an error status from the source is a failure, not a figure', async () => {
  stubFetch(toJsonResponse({ error: 'package not found' }, 404))

  const reading = await readSource(
    { kind: 'npm', packageName: 'missing-package', cadence: DAILY },
    null,
  )

  expect(reading).toEqual({
    kind: 'failed',
    reason: { kind: 'http', status: 404 },
  })
})

test('a response of the wrong shape is a failure', async () => {
  stubFetch(toJsonResponse({ downloads: 'many' }))

  const reading = await readSource(
    { kind: 'npm', packageName: 'some-package', cadence: DAILY },
    null,
  )

  expect(reading).toEqual({
    kind: 'failed',
    reason: { kind: 'invalid-response' },
  })
})

test('a lost connection is a failure', async () => {
  stubFetch(new TypeError('fetch failed'))

  const reading = await readSource(
    { kind: 'npm', packageName: 'some-package', cadence: DAILY },
    null,
  )

  expect(reading).toEqual({ kind: 'failed', reason: { kind: 'network' } })
})

test('GitHub commits count the author against all contributors, with the token', async () => {
  const fetchMock = stubFetch(
    toJsonResponse([
      { login: 'anders-planck', contributions: 150 },
      { login: 'someone-else', contributions: 7 },
    ]),
  )

  const reading = await readSource(
    {
      kind: 'github-commits',
      repos: ['a-cube-io/ereceipts-js-sdk'],
      login: 'Anders-planck',
      needsToken: false,
      cadence: DAILY,
    },
    TOKEN,
  )

  expect(reading).toEqual({ kind: 'ok', figure: { value: 150, total: 157 } })
  const [url] = fetchMock.mock.calls[0] ?? []
  expect(url).toBe(
    'https://api.github.com/repos/a-cube-io/ereceipts-js-sdk/contributors?per_page=100&page=1',
  )
  expect(toHeaders(fetchMock.mock.calls[0]).get('Authorization')).toBe(
    `Bearer ${TOKEN}`,
  )
  expect(toHeaders(fetchMock.mock.calls[0]).get('User-Agent')).not.toBeNull()
})

test('GitHub commits are summed over several repositories', async () => {
  stubFetch(
    toJsonResponse([{ login: 'Anders-planck', contributions: 1000 }]),
    toJsonResponse([
      { login: 'Anders-planck', contributions: 72 },
      { login: 'other', contributions: 3 },
    ]),
  )

  const reading = await readSource(
    {
      kind: 'github-commits',
      repos: ['owner/one', 'owner/two'],
      login: 'Anders-planck',
      needsToken: true,
      cadence: 'weekly',
    },
    TOKEN,
  )

  expect(reading).toEqual({ kind: 'ok', figure: { value: 1072, total: 1075 } })
})

test('GitHub contributors are read page by page', async () => {
  const fullPage = Array.from({ length: 100 }, (_, position) => ({
    login: `contributor-${String(position)}`,
    contributions: 1,
  }))
  const fetchMock = stubFetch(
    toJsonResponse(fullPage),
    toJsonResponse([{ login: 'Anders-planck', contributions: 5 }]),
  )

  const reading = await readSource(
    {
      kind: 'github-commits',
      repos: ['owner/big'],
      login: 'Anders-planck',
      needsToken: false,
      cadence: DAILY,
    },
    null,
  )

  expect(reading).toEqual({ kind: 'ok', figure: { value: 5, total: 105 } })
  expect(fetchMock.mock.calls[1]?.[0]).toContain('page=2')
})

test('an author missing from the contributors is a failure, not zero', async () => {
  stubFetch(toJsonResponse([{ login: 'someone-else', contributions: 7 }]))

  const reading = await readSource(
    {
      kind: 'github-commits',
      repos: ['owner/repo'],
      login: 'Anders-planck',
      needsToken: false,
      cadence: DAILY,
    },
    null,
  )

  expect(reading).toEqual({
    kind: 'failed',
    reason: { kind: 'author-not-found' },
  })
})

test('a private source is not read without the token', async () => {
  const fetchMock = stubFetch()

  const reading = await readSource(
    {
      kind: 'github-search',
      query: 'is:pr is:merged author:Anders-planck org:example',
      needsToken: true,
      cadence: DAILY,
    },
    null,
  )

  expect(reading).toEqual({ kind: 'failed', reason: { kind: 'missing-token' } })
  expect(fetchMock).not.toHaveBeenCalled()
})

test('a GitHub search counts its results', async () => {
  const fetchMock = stubFetch(
    toJsonResponse({ total_count: 282, incomplete_results: false, items: [] }),
  )

  const reading = await readSource(
    {
      kind: 'github-search',
      query: 'is:pr is:merged author:Anders-planck org:example',
      needsToken: true,
      cadence: DAILY,
    },
    TOKEN,
  )

  expect(reading).toEqual({ kind: 'ok', figure: { value: 282, total: null } })
  expect(fetchMock.mock.calls[0]?.[0]).toBe(
    'https://api.github.com/search/issues?q=is%3Apr+is%3Amerged+author%3AAnders-planck+org%3Aexample&per_page=1',
  )
})

test('an incomplete GitHub search is a failure', async () => {
  stubFetch(
    toJsonResponse({ total_count: 12, incomplete_results: true, items: [] }),
  )

  const reading = await readSource(
    {
      kind: 'github-search',
      query: 'is:pr',
      needsToken: false,
      cadence: DAILY,
    },
    null,
  )

  expect(reading).toEqual({ kind: 'failed', reason: { kind: 'incomplete' } })
})
