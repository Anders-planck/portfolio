import { expect, test } from 'vitest'

import { toBlockTransform } from './to-block-transform'

const SCROLL_POSE = { yawDeg: 40, scale: 0.8 }
const STILL = {
  scrollPose: SCROLL_POSE,
  turnYawDeg: 0,
  dragPitchDeg: 0,
  pointer: undefined,
  hasBeenTurned: false,
}

test('with no pointer and no turn the Block shows the scroll pose, tilted back', () => {
  expect(toBlockTransform(STILL)).toBe(
    'rotateX(-14deg) rotateY(40deg) scale(0.8)',
  )
})

test('a turn and a drag add to the scroll pose', () => {
  expect(
    toBlockTransform({ ...STILL, turnYawDeg: -90, dragPitchDeg: 10 }),
  ).toBe('rotateX(-4deg) rotateY(-50deg) scale(0.8)')
})

test('the Block leans toward the pointer', () => {
  // The pointer at the right edge, level with the middle of the viewport.
  expect(
    toBlockTransform({ ...STILL, pointer: { horizontal: 1, vertical: 0 } }),
  ).toBe('rotateX(-14deg) rotateY(70deg) scale(0.8)')
  // At the bottom edge it tips toward the reader.
  expect(
    toBlockTransform({ ...STILL, pointer: { horizontal: 0, vertical: 1 } }),
  ).toBe('rotateX(-24deg) rotateY(40deg) scale(0.8)')
})

test('once the reader has turned the Block it follows the pointer less', () => {
  expect(
    toBlockTransform({
      ...STILL,
      pointer: { horizontal: 1, vertical: 1 },
      hasBeenTurned: true,
    }),
  ).toBe('rotateX(-18deg) rotateY(46deg) scale(0.8)')
})
