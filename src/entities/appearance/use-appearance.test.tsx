// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { expect, test, vi } from 'vitest'

import { createAppearance } from './appearance.fixture'
import {
  appearanceCssQueryOptions,
  appearanceQueryOptions,
} from './appearance-query-options'
import { type AppearanceCss, getAppearanceCss } from './get-appearance-css'
import { useAppearance } from './use-appearance'

// The server function reads Convex and runs on the Worker; here each test
// decides what it returns.
vi.mock('./get-appearance-css', () => ({ getAppearanceCss: vi.fn() }))

const PUBLISHED = createAppearance({ theme: { basePx: 18 } })
const REPUBLISHED = createAppearance({ theme: { basePx: 20 } })

/** A client seeded as the loader leaves it: the live params and, maybe, a CSS. */
function createSeededClient(css: AppearanceCss | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClient.setQueryData(appearanceQueryOptions.queryKey, PUBLISHED)
  if (css !== null) {
    queryClient.setQueryData(appearanceCssQueryOptions.queryKey, css)
  }
  return queryClient
}

function renderUseAppearance(queryClient: QueryClient) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return renderHook(() => useAppearance(), { wrapper })
}

test('the CSS of the live params is used as it is', () => {
  vi.mocked(getAppearanceCss).mockClear()
  const queryClient = createSeededClient({
    appearance: PUBLISHED,
    css: 'css 18',
  })
  const { result } = renderUseAppearance(queryClient)
  expect(result.current).toEqual({ appearance: PUBLISHED, css: 'css 18' })
  expect(getAppearanceCss).not.toHaveBeenCalled()
})

test('a publish fetches the new CSS and keeps the old one until it arrives', async () => {
  let deliverNewCss: (css: AppearanceCss) => void = () => undefined
  const newCss = new Promise<AppearanceCss>((resolve) => {
    deliverNewCss = resolve
  })
  vi.mocked(getAppearanceCss).mockReturnValue(newCss)
  const queryClient = createSeededClient({
    appearance: PUBLISHED,
    css: 'css 18',
  })
  const { result } = renderUseAppearance(queryClient)
  queryClient.setQueryData(appearanceQueryOptions.queryKey, REPUBLISHED)
  await waitFor(() => {
    expect(getAppearanceCss).toHaveBeenCalled()
  })
  expect(result.current).toEqual({ appearance: REPUBLISHED, css: 'css 18' })

  deliverNewCss({ appearance: REPUBLISHED, css: 'css 20' })
  await waitFor(() => {
    expect(result.current.css).toBe('css 20')
  })
})

test('when the new CSS fails, the last good CSS stays', async () => {
  vi.mocked(getAppearanceCss).mockRejectedValue(new Error('Convex is down'))
  const queryClient = createSeededClient({
    appearance: PUBLISHED,
    css: 'css 18',
  })
  const { result } = renderUseAppearance(queryClient)
  queryClient.setQueryData(appearanceQueryOptions.queryKey, REPUBLISHED)
  await waitFor(() => {
    expect(
      queryClient.getQueryState(appearanceCssQueryOptions.queryKey)?.status,
    ).toBe('error')
  })
  expect(result.current).toEqual({ appearance: REPUBLISHED, css: 'css 18' })
})

test('without any CSS the page renders with the built theme', () => {
  vi.mocked(getAppearanceCss).mockRejectedValue(new Error('Convex is down'))
  const { result } = renderUseAppearance(createSeededClient(null))
  expect(result.current.css).toBeUndefined()
})
