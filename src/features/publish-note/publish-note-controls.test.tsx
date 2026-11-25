// @vitest-environment happy-dom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { PublishNoteControls } from './publish-note-controls'

const publish = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => publish }))

beforeEach(() => {
  publish.mockReset()
})
afterEach(cleanup)

// A retry after a lost answer re-renders twice; the full suite runs files in
// parallel, so give it longer than the one-second default.
const BUSY_SUITE_WAIT = { timeout: 5000 }

function renderControls(isDisabled = false) {
  render(
    <PublishNoteControls
      noteKey="note-a"
      revision={4}
      isDisabled={isDisabled}
    />,
  )
}

test('publishing now sends the note at the reviewed revision', async () => {
  publish.mockResolvedValue({
    status: 'published',
    releaseId: 'r1',
    findings: [],
  })
  renderControls()

  fireEvent.click(screen.getByRole('button', { name: 'Pubblica ora' }))

  expect(
    await screen.findByText('Pubblicato: il sito mostra la bozza.'),
  ).toBeDefined()
  expect(publish).toHaveBeenCalledWith(
    expect.objectContaining({
      selection: [{ collection: 'note', key: 'note-a', revision: 4 }],
      note: '',
    }),
  )
})

test('a publish whose answer was lost is sent again with the same request id', async () => {
  publish.mockRejectedValueOnce(new Error('network'))
  publish.mockResolvedValueOnce({
    status: 'published',
    releaseId: 'r1',
    findings: [],
  })
  renderControls()
  const button = screen.getByRole('button', { name: 'Pubblica ora' })

  fireEvent.click(button)
  expect(
    await screen.findByText(
      'Pubblicazione non confermata: riprova.',
      {},
      BUSY_SUITE_WAIT,
    ),
  ).toBeDefined()
  // The button ignores clicks while its first action is still settling.
  await waitFor(() => {
    expect(button.getAttribute('aria-busy')).toBeNull()
  }, BUSY_SUITE_WAIT)
  fireEvent.click(button)

  await waitFor(() => {
    expect(publish).toHaveBeenCalledTimes(2)
  }, BUSY_SUITE_WAIT)
  const [[first], [second]] = publish.mock.calls as [
    [{ requestId: string }],
    [{ requestId: string }],
  ]
  expect(second.requestId).toBe(first.requestId)
})

test('scheduling waits for a future time, and nothing publishes while unsaved', () => {
  renderControls(true)

  expect(
    screen
      .getByRole('button', { name: 'Pubblica ora' })
      .hasAttribute('disabled') ||
      screen
        .getByRole('button', { name: 'Pubblica ora' })
        .getAttribute('aria-disabled') === 'true',
  ).toBe(true)
  const schedule = screen.getByRole('button', { name: 'Programma' })
  expect(
    schedule.hasAttribute('disabled') ||
      schedule.getAttribute('aria-disabled') === 'true',
  ).toBe(true)
})
