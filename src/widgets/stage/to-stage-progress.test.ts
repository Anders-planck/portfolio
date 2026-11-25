import { expect, test } from 'vitest'

import { toStageProgress } from './to-stage-progress'

const VIEWPORT_HEIGHT_PX = 800
const STAGE_HEIGHT_PX = 4000

test('the progress is where the middle of the viewport is on the stage', () => {
  expect(
    toStageProgress({
      stageTopPx: -1600,
      stageHeightPx: STAGE_HEIGHT_PX,
      viewportHeightPx: VIEWPORT_HEIGHT_PX,
    }),
  ).toBe(0.5)
})

test('before the stage reaches the middle of the viewport it is 0', () => {
  expect(
    toStageProgress({
      stageTopPx: 600,
      stageHeightPx: STAGE_HEIGHT_PX,
      viewportHeightPx: VIEWPORT_HEIGHT_PX,
    }),
  ).toBe(0)
})

test('once the stage has passed the middle of the viewport it is 1', () => {
  expect(
    toStageProgress({
      stageTopPx: -3700,
      stageHeightPx: STAGE_HEIGHT_PX,
      viewportHeightPx: VIEWPORT_HEIGHT_PX,
    }),
  ).toBe(1)
})

test('a stage with no height is at its start', () => {
  expect(
    toStageProgress({
      stageTopPx: -100,
      stageHeightPx: 0,
      viewportHeightPx: VIEWPORT_HEIGHT_PX,
    }),
  ).toBe(0)
})
