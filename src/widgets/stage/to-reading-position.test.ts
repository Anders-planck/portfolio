import { expect, test } from 'vitest'

import {
  toReadingPosition,
  toScrollYAtReadingPosition,
} from './to-reading-position'

const VIEWPORT_HEIGHT_PX = 800

test('the reading position is the chapter under the middle line and how far into it', () => {
  // The middle line (400px) falls 100px into the second chapter, 400px tall.
  expect(
    toReadingPosition(
      [
        { topPx: -500, heightPx: 800 },
        { topPx: 300, heightPx: 400 },
      ],
      VIEWPORT_HEIGHT_PX,
    ),
  ).toEqual({ chapterIndex: 1, shareWithin: 0.25 })
})

test('above or below every chapter there is no reading position', () => {
  expect(
    toReadingPosition([{ topPx: 600, heightPx: 400 }], VIEWPORT_HEIGHT_PX),
  ).toBeUndefined()
  expect(
    toReadingPosition([{ topPx: -900, heightPx: 400 }], VIEWPORT_HEIGHT_PX),
  ).toBeUndefined()
})

test('the scroll that puts the same point of the chapter under the middle line', () => {
  expect(
    toScrollYAtReadingPosition({
      shareWithin: 0.25,
      sectionTopInDocumentPx: 2000,
      sectionHeightPx: 1600,
      viewportHeightPx: VIEWPORT_HEIGHT_PX,
    }),
  ).toBe(2000 + 400 - 400)
})

test('a position near the top of the page never asks for a negative scroll', () => {
  expect(
    toScrollYAtReadingPosition({
      shareWithin: 0,
      sectionTopInDocumentPx: 100,
      sectionHeightPx: 600,
      viewportHeightPx: VIEWPORT_HEIGHT_PX,
    }),
  ).toBe(0)
})
