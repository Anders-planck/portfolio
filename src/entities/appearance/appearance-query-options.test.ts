import { QueryClient } from '@tanstack/react-query'
import { beforeEach, expect, test, vi } from 'vitest'

import type { Appearance } from './appearance-css'
import { appearanceCssQueryOptions } from './appearance-query-options'
import { getAppearanceCss } from './get-appearance-css'

// The server function reads Convex and runs on the Worker; here it returns
// whatever each test publishes.
vi.mock('./get-appearance-css', () => ({ getAppearanceCss: vi.fn() }))

function createAppearance(basePx: number): Appearance {
  return {
    theme: {
      basePx,
      ratio: 1.25,
      fonts: { body: 'Figtree', heading: 'Figtree', code: 'ui-monospace' },
      radiusMultiplier: 1,
      mode: 'system',
    },
    motion: { tempo: 1, character: 'standard' },
  }
}

function serverMadeCssFor(appearance: Appearance) {
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
  serverMadeCssFor(createAppearance(18))
  await expect(
    queryClient.query(appearanceCssQueryOptions(createAppearance(18))),
  ).resolves.toEqual({ appearance: createAppearance(18), css: 'css 18' })
})

test('CSS made from params published in between is never kept under the old key', async () => {
  serverMadeCssFor(createAppearance(20))
  await expect(
    queryClient.query(appearanceCssQueryOptions(createAppearance(18))),
  ).rejects.toThrow('The appearance changed while its CSS was made')
  expect(
    queryClient.getQueryData(
      appearanceCssQueryOptions(createAppearance(18)).queryKey,
    ),
  ).toBeUndefined()
})
