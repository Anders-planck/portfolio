import { beforeEach, expect, test, vi } from 'vitest'

import { log } from '../../shared/server/log'
import { createAppearance } from './appearance.fixture'
import { readPublishedAppearanceCss } from './get-appearance-css'

const { readPublishedFromConvex } = vi.hoisted(() => ({
  readPublishedFromConvex: vi.fn(),
}))

// Convex answers with whatever each test publishes; the URL is a stand-in.
vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    query = readPublishedFromConvex
  },
}))
vi.mock('../../shared/config/env', () => ({
  readConvexUrl: () => 'http://convex.test',
}))
vi.mock('../../shared/server/log', () => ({ log: vi.fn() }))

beforeEach(() => {
  vi.mocked(log).mockClear()
})

test('the CSS is made from the params Convex serves, and returned with them', async () => {
  const appearance = createAppearance({ theme: { basePx: 18 } })
  readPublishedFromConvex.mockResolvedValue(appearance)
  const appearanceCss = await readPublishedAppearanceCss()
  expect(appearanceCss.appearance).toEqual(appearance)
  expect(appearanceCss.css).toContain(
    '--_scaled-font-size-base: min(calc(1.125rem',
  )
  expect(log).not.toHaveBeenCalled()
})

test('a failure is logged on the server and passed on', async () => {
  const failure = new Error('Convex is down')
  readPublishedFromConvex.mockRejectedValue(failure)
  await expect(readPublishedAppearanceCss()).rejects.toBe(failure)
  expect(log).toHaveBeenCalledWith('appearance css', failure)
})
