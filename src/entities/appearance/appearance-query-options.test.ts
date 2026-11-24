import { QueryClient } from '@tanstack/react-query'
import { beforeEach, expect, test, vi } from 'vitest'

import type { Appearance } from './appearance'
import { createAppearance } from './appearance.fixture'
import { appearanceCssQueryOptions } from './appearance-query-options'
import { getAppearanceCss } from './get-appearance-css'

// The server function reads Convex and runs on the Worker; here it returns
// whatever each test publishes.
vi.mock('./get-appearance-css', () => ({ getAppearanceCss: vi.fn() }))

function mockServerCssFor(appearance: Appearance) {
  vi.mocked(getAppearanceCss).mockResolvedValue({
    appearance,
    css: `css ${String(appearance.theme.basePx)}`,
  })
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

beforeEach(() => {
  queryClient.clear()
})

test('the CSS made from the params of the key is kept under that key', async () => {
  mockServerCssFor(createAppearance({ theme: { basePx: 18 } }))
  await expect(
    queryClient.query(
      appearanceCssQueryOptions(createAppearance({ theme: { basePx: 18 } })),
    ),
  ).resolves.toEqual({
    appearance: createAppearance({ theme: { basePx: 18 } }),
    css: 'css 18',
  })
})

test('CSS made from params published in between is never kept under the old key', async () => {
  mockServerCssFor(createAppearance({ theme: { basePx: 20 } }))
  await expect(
    queryClient.query(
      appearanceCssQueryOptions(createAppearance({ theme: { basePx: 18 } })),
    ),
  ).rejects.toThrow('The appearance changed while its CSS was made')
  expect(
    queryClient.getQueryData(
      appearanceCssQueryOptions(createAppearance({ theme: { basePx: 18 } }))
        .queryKey,
    ),
  ).toBeUndefined()
})
