import { expect, test } from 'vitest'

import { toUntransformedRect } from './to-untransformed-rect'

const RECT = { left: 107, top: 103.5, width: 80, height: 40 }

test('a control at rest is where it is measured', () => {
  expect(toUntransformedRect(RECT, 'none')).toEqual(RECT)
})

test('a control mid-pull is measured where it sits without the pull', () => {
  expect(toUntransformedRect(RECT, 'matrix(1, 0, 0, 1, 7, 3.5)')).toEqual({
    left: 100,
    top: 100,
    width: 80,
    height: 40,
  })
})

test('a 3D translate counts the same way', () => {
  expect(
    toUntransformedRect(
      RECT,
      'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7, 3.5, 0, 1)',
    ),
  ).toEqual({ left: 100, top: 100, width: 80, height: 40 })
})
