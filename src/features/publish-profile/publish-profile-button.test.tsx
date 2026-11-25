// @vitest-environment happy-dom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { PublishProfileButton } from './publish-profile-button'

const publish = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => publish }))

const PUBLISHED = { status: 'published', releaseId: 'release-1', findings: [] }

beforeEach(() => {
  publish.mockReset()
  publish.mockResolvedValue(PUBLISHED)
})
afterEach(cleanup)

function clickPublish() {
  fireEvent.click(screen.getByRole('button', { name: 'Pubblica' }))
}

function readRequestIds() {
  return publish.mock.calls.map(
    ([request]: [{ requestId: string }]) => request.requestId,
  )
}

test('publishes the Profile at the revision shown and says so', async () => {
  render(<PublishProfileButton revision={7} isDisabled={false} />)

  clickPublish()

  expect(
    await screen.findByText('Pubblicato: il sito mostra la bozza.'),
  ).toBeDefined()
  expect(publish).toHaveBeenCalledWith(
    expect.objectContaining({
      selection: [{ collection: 'profile', key: 'main', revision: 7 }],
    }),
  )
})

test('a publish whose answer was lost is retried with the same request id', async () => {
  publish.mockRejectedValueOnce(new Error('network'))
  render(<PublishProfileButton revision={7} isDisabled={false} />)

  clickPublish()
  expect(
    await screen.findByText('Pubblicazione non confermata: riprova.'),
  ).toBeDefined()
  clickPublish()
  await screen.findByText('Pubblicato: il sito mostra la bozza.')

  const [lostId, retryId] = readRequestIds()
  expect(retryId).toBe(lostId)
})

test('a confirmed publish is not repeated by the next click', async () => {
  render(<PublishProfileButton revision={7} isDisabled={false} />)

  clickPublish()
  await screen.findByText('Pubblicato: il sito mostra la bozza.')
  clickPublish()
  await waitFor(() => {
    expect(publish).toHaveBeenCalledTimes(2)
  })

  const [firstId, secondId] = readRequestIds()
  expect(secondId).not.toBe(firstId)
})

test('a stale draft asks to review again', async () => {
  publish.mockResolvedValueOnce({ status: 'stale', documents: [] })
  render(<PublishProfileButton revision={7} isDisabled={false} />)

  clickPublish()

  expect(
    await screen.findByText(
      'La bozza è cambiata nel frattempo: ricontrolla e pubblica di nuovo.',
    ),
  ).toBeDefined()
})

test('nothing to publish before the first save, nor while saving', () => {
  const { rerender } = render(
    <PublishProfileButton revision={null} isDisabled={false} />,
  )
  clickPublish()
  rerender(<PublishProfileButton revision={7} isDisabled />)
  clickPublish()

  expect(publish).not.toHaveBeenCalled()
})
