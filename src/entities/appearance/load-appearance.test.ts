import { QueryClient } from '@tanstack/react-query'
import { expect, test, vi } from 'vitest'

import { createAppearance } from './appearance.fixture'
import {
  appearanceCssQueryOptions,
  appearanceQueryOptions,
} from './appearance-query-options'
import { getAppearanceCss } from './get-appearance-css'
import { loadAppearance } from './load-appearance'

// The server function reads Convex and runs on the Worker; here each test
// decides what it returns.
vi.mock('./get-appearance-css', () => ({ getAppearanceCss: vi.fn() }))

/** A client whose Convex query answers with params of `publishedBasePx`. */
function createQueryClient(publishedBasePx: number) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryFn: () => createAppearance({ theme: { basePx: publishedBasePx } }),
      },
    },
  })
}

function mockServerCssFor(basePx: number) {
  vi.mocked(getAppearanceCss).mockResolvedValue({
    appearance: createAppearance({ theme: { basePx } }),
    css: `css ${String(basePx)}`,
  })
}

function mockServerFailure() {
  vi.mocked(getAppearanceCss).mockRejectedValue(new Error('Convex is down'))
}

function readCss(queryClient: QueryClient) {
  return queryClient.getQueryData(appearanceCssQueryOptions().queryKey)?.css
}

test('the loader fills the params and their CSS', async () => {
  const queryClient = createQueryClient(18)
  mockServerCssFor(18)
  await loadAppearance(queryClient)
  expect(
    queryClient.getQueryData(appearanceQueryOptions().queryKey)?.theme.basePx,
  ).toBe(18)
  expect(readCss(queryClient)).toBe('css 18')
})

test('a publish between the two reads does not fail the loader', async () => {
  const queryClient = createQueryClient(18)
  mockServerCssFor(20)
  await expect(loadAppearance(queryClient)).resolves.toBeUndefined()
  expect(readCss(queryClient)).toBe('css 20')
})

test('a CSS that cannot be made leaves the page on the built theme', async () => {
  const queryClient = createQueryClient(18)
  mockServerFailure()
  await expect(loadAppearance(queryClient)).resolves.toBeUndefined()
  expect(readCss(queryClient)).toBeUndefined()
})
