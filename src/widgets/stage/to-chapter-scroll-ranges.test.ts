import { expect, test } from 'vitest'

import { toChapterScrollRanges } from './to-chapter-scroll-ranges'

test('equal shares give every chapter one viewport and an equal range', () => {
  expect(toChapterScrollRanges([20, 20, 20, 20])).toEqual([
    { lengthInViewports: 1, scrollRangeStart: 0, scrollRangeEnd: 0.25 },
    { lengthInViewports: 1, scrollRangeStart: 0.25, scrollRangeEnd: 0.5 },
    { lengthInViewports: 1, scrollRangeStart: 0.5, scrollRangeEnd: 0.75 },
    { lengthInViewports: 1, scrollRangeStart: 0.75, scrollRangeEnd: 1 },
  ])
})

test('a larger share scrolls longer, in proportion to the average share', () => {
  const [first, second] = toChapterScrollRanges([30, 10])
  expect(first?.lengthInViewports).toBe(1.5)
  expect(second?.lengthInViewports).toBe(1)
  expect(first?.scrollRangeEnd).toBeCloseTo(0.6)
})

test('no chapter scrolls less than one viewport, so its text can pin', () => {
  const lengths = toChapterScrollRanges([5, 45]).map(
    (range) => range.lengthInViewports,
  )
  expect(lengths).toEqual([1, 1.8])
})

test('a missing or broken share counts as an average one', () => {
  expect(
    toChapterScrollRanges([0, Number.NaN, 10]).map(
      (range) => range.lengthInViewports,
    ),
  ).toEqual([1, 1, 1])
})

test('ranges are contiguous and end at 1', () => {
  const ranges = toChapterScrollRanges([15, 18, 20, 16, 16, 15])
  ranges.slice(1).forEach((range, index) => {
    expect(range.scrollRangeStart).toBe(ranges[index]?.scrollRangeEnd)
  })
  expect(ranges.at(-1)?.scrollRangeEnd).toBe(1)
})

test('no chapters, no ranges', () => {
  expect(toChapterScrollRanges([])).toEqual([])
})
