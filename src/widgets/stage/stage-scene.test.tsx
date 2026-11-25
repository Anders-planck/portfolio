// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import {
  ANIMATED_FINE_POINTER,
  renderForReader,
  TEST_CHAPTERS,
  TEST_FACES,
} from './stage.fixture'
import { StageScene } from './stage-scene'

afterEach(cleanup)

function renderScene(
  readScrollPose: (() => { yawDeg: number; scale: number }) | undefined,
) {
  return renderForReader(
    <StageScene
      chapters={TEST_CHAPTERS}
      faces={TEST_FACES}
      activeChapterIndex={0}
      readScrollPose={readScrollPose}
      onGoToChapter={() => undefined}
      onGoToAdjacentChapter={() => undefined}
    />,
    ANIMATED_FINE_POINTER,
  )
}

test('the scene holds the Block, the chapter navigation and the chapter index', async () => {
  renderScene(() => ({ yawDeg: 0, scale: 1 }))
  expect(await screen.findByRole('slider', { name: 'Blocco' })).toBeDefined()
  expect(screen.getByRole('group', { name: 'Capitolo' })).toBeDefined()
  expect(screen.getByRole('list', { name: 'Capitoli' })).toBeDefined()
})

test('without a scroll pose its Block stands still', async () => {
  renderScene(undefined)
  await screen.findByRole('group', { name: 'Capitolo' })
  expect(screen.queryByRole('slider')).toBeNull()
})
