// @vitest-environment happy-dom
import { act, cleanup, render, screen } from '@testing-library/react'
import { ConvexError } from 'convex/values'
import { afterEach, expect, test } from 'vitest'

import { RefusalBoundary } from './refusal-boundary.fixture'
import { useBackendRefusal } from './use-backend-refusal'

afterEach(cleanup)

let takeRefusalForTest: ((error: unknown) => boolean) | null = null

function RefusalProbe() {
  takeRefusalForTest = useBackendRefusal()
  return 'ready'
}

function renderProbe() {
  render(
    <RefusalBoundary>
      <RefusalProbe />
    </RefusalBoundary>,
  )
  if (takeRefusalForTest === null) {
    throw new Error('The probe did not render')
  }
  return takeRefusalForTest
}

test('any other error is left to the caller', () => {
  const takeRefusal = renderProbe()

  let isTaken = true
  act(() => {
    isTaken = takeRefusal(new Error('Connection lost'))
  })

  expect(isTaken).toBe(false)
  expect(screen.getByText('ready')).toBeDefined()
})

test('a backend refusal is taken and thrown to the error boundary', () => {
  const takeRefusal = renderProbe()

  let isTaken = false
  act(() => {
    isTaken = takeRefusal(new ConvexError({ kind: 'signed-out' }))
  })

  expect(isTaken).toBe(true)
  expect(screen.getByText('refused: signed-out')).toBeDefined()
})
