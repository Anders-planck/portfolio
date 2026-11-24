import { expect, test } from 'vitest'

import { createAppearance } from './appearance.fixture'
import { createAppearanceCssCache } from './appearance-css-cache'

/** Reads through `cache`, recording which appearances had to be made. */
function readCounting(cache: ReturnType<typeof createAppearanceCssCache>) {
  const madeFor: number[] = []
  const read = (basePx: number) =>
    cache.readOrMakeCss(createAppearance({ theme: { basePx } }), () => {
      madeFor.push(basePx)
      return `css ${String(basePx)}`
    })
  return { read, madeFor }
}

test('the CSS of an appearance is made once and then reused', () => {
  const { read, madeFor } = readCounting(createAppearanceCssCache(2))
  expect(read(16)).toBe('css 16')
  expect(read(16)).toBe('css 16')
  expect(madeFor).toEqual([16])
})

test('past capacity, the least recently read appearance is made again', () => {
  const { read, madeFor } = readCounting(createAppearanceCssCache(2))
  read(16)
  read(18)
  read(16)
  read(20)
  read(16)
  read(18)
  expect(madeFor).toEqual([16, 18, 20, 18])
})
