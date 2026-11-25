// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, expect, test } from 'vitest'

import { TEST_FACES } from './block.fixture'
import { BlockShape } from './block-shape'

afterEach(cleanup)

test('the shape shows the four faces, numbered from 01', () => {
  render(<BlockShape faces={TEST_FACES} />)
  expect(
    ['Nord', 'Est', 'Sud', 'Ovest'].map((label) => screen.getByText(label)),
  ).toHaveLength(4)
  expect(
    ['01', '02', '03', '04'].map((number) => screen.getByText(number)),
  ).toHaveLength(4)
})

test('the turning element is handed to the driver through blockRef', () => {
  const blockRef = createRef<HTMLElement>()
  render(<BlockShape faces={TEST_FACES} blockRef={blockRef} />)
  expect(blockRef.current?.textContent).toContain('Nord')
})
