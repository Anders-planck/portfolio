import { expect, test } from 'vitest'

import { toBlockPoseAtProgress } from './to-block-pose-at-progress'

const OPENING = {
  scrollRangeStart: 0,
  scrollRangeEnd: 0.2,
  blockPose: { yawDeg: 20, scale: 1 },
}
const MIDDLE = {
  scrollRangeStart: 0.2,
  scrollRangeEnd: 0.6,
  blockPose: { yawDeg: 110, scale: 0.8 },
}
const CLOSING = {
  scrollRangeStart: 0.6,
  scrollRangeEnd: 1,
  blockPose: { yawDeg: 200, scale: 0.6 },
}
const CHAPTERS = [OPENING, MIDDLE, CLOSING]

test('in the middle of a chapter the Block holds that chapter pose', () => {
  expect(toBlockPoseAtProgress(0.4, CHAPTERS)).toEqual(MIDDLE.blockPose)
})

test('between two chapter middles the pose moves from one to the other', () => {
  // Halfway between the opening middle (0.1) and the next middle (0.4).
  const pose = toBlockPoseAtProgress(0.25, CHAPTERS)
  expect(pose.yawDeg).toBeCloseTo(65)
  expect(pose.scale).toBeCloseTo(0.9)
})

test('before the first middle and after the last the end poses hold', () => {
  expect(toBlockPoseAtProgress(0, CHAPTERS)).toEqual(OPENING.blockPose)
  expect(toBlockPoseAtProgress(1, CHAPTERS)).toEqual(CLOSING.blockPose)
})

test('without chapters the Block rests facing front at full size', () => {
  expect(toBlockPoseAtProgress(0.5, [])).toEqual({ yawDeg: 0, scale: 1 })
})
