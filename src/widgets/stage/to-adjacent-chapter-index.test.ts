import { expect, test } from 'vitest'

import { toAdjacentChapterIndex } from './to-adjacent-chapter-index'

const AT_REST = { requestedChapterIndex: undefined, chapterCount: 5 }

test('with nothing on its way, ‹ › step from the active chapter', () => {
  expect(
    toAdjacentChapterIndex({ ...AT_REST, activeChapterIndex: 2, step: 1 }),
  ).toBe(3)
  expect(
    toAdjacentChapterIndex({ ...AT_REST, activeChapterIndex: 2, step: -1 }),
  ).toBe(1)
})

test('while a scroll is on its way, ‹ › step from where it is going', () => {
  expect(
    toAdjacentChapterIndex({
      requestedChapterIndex: 3,
      activeChapterIndex: 2,
      chapterCount: 5,
      step: 1,
    }),
  ).toBe(4)
})

test('there is nothing before the opening or after the last chapter', () => {
  expect(
    toAdjacentChapterIndex({ ...AT_REST, activeChapterIndex: 0, step: -1 }),
  ).toBeUndefined()
  expect(
    toAdjacentChapterIndex({ ...AT_REST, activeChapterIndex: 4, step: 1 }),
  ).toBeUndefined()
})
