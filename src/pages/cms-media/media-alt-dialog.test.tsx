// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ConvexError } from 'convex/values'
import { afterEach, expect, test, vi } from 'vitest'

import {
  MEDIA_LIMITS,
  SCREENSHOT_ENTRY,
} from '../../entities/media/media.fixture'
import type { AltSaveOutcome } from '../../entities/media/media-library-query-options'
import { RefusalBoundary } from '../../shared/convex/refusal-boundary.fixture'
import { MediaAltDialog } from './media-alt-dialog'

afterEach(cleanup)

const SAVED: AltSaveOutcome = { kind: 'saved', savedAt: 1 }

function renderDialog(onSaveAlt: () => Promise<AltSaveOutcome>) {
  const onClose = vi.fn()
  render(
    <RefusalBoundary>
      <MediaAltDialog
        entry={SCREENSHOT_ENTRY}
        maxAltLength={MEDIA_LIMITS.maxAltLength}
        onSaveAlt={onSaveAlt}
        onClose={onClose}
      />
    </RefusalBoundary>,
  )
  return onClose
}

test('each locale opens with its saved alt', () => {
  renderDialog(vi.fn())

  expect(
    screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Alt · Italiano' })
      .value,
  ).toBe('Chat di Bussola')
  expect(
    screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Alt · English' })
      .value,
  ).toBe('')
})

test('a changed alt saves when the field loses focus, and says so', async () => {
  const onSaveAlt = vi.fn(() => Promise.resolve(SAVED))
  renderDialog(onSaveAlt)
  const english = screen.getByRole('textbox', { name: 'Alt · English' })

  fireEvent.change(english, { target: { value: 'Bussola chat' } })
  fireEvent.blur(english)

  expect(await screen.findByText('Salvato')).toBeDefined()
  expect(onSaveAlt).toHaveBeenCalledWith({ locale: 'en', alt: 'Bussola chat' })
})

test('leaving a field unchanged saves nothing', () => {
  const onSaveAlt = vi.fn(() => Promise.resolve(SAVED))
  renderDialog(onSaveAlt)

  fireEvent.blur(screen.getByRole('textbox', { name: 'Alt · Italiano' }))

  expect(onSaveAlt).not.toHaveBeenCalled()
})

test('a failed save says so', async () => {
  renderDialog(() => Promise.reject(new Error('offline')))
  const german = screen.getByRole('textbox', { name: 'Alt · Deutsch' })

  fireEvent.change(german, { target: { value: 'Chat' } })
  fireEvent.blur(german)

  expect(await screen.findByText('Non salvato. Riprova.')).toBeDefined()
})

test('the close button closes the dialog', () => {
  const onClose = renderDialog(vi.fn())

  // Astryx's own label: English here, Italian under the CMS locale provider.
  fireEvent.click(screen.getByRole('button', { name: /^(close|chiudi)$/i }))

  expect(onClose).toHaveBeenCalled()
})

test('a backend refusal goes to the error boundary, not to "Non salvato"', async () => {
  renderDialog(() => Promise.reject(new ConvexError({ kind: 'not-owner' })))
  const english = screen.getByRole('textbox', { name: 'Alt · English' })

  fireEvent.change(english, { target: { value: 'Chat' } })
  fireEvent.blur(english)

  expect(await screen.findByText('refused: not-owner')).toBeDefined()
  // The editor gave way to the boundary instead of offering a retry.
  expect(screen.queryByRole('textbox')).toBeNull()
})

test('an empty alt is refused and the field says why', async () => {
  renderDialog(() =>
    Promise.resolve<AltSaveOutcome>({ kind: 'refused', reason: 'empty' }),
  )
  const italian = screen.getByRole('textbox', { name: 'Alt · Italiano' })

  fireEvent.change(italian, { target: { value: '  ' } })
  fireEvent.blur(italian)

  expect(
    await screen.findByText(
      'Il testo alternativo non può essere vuoto: descrivi cosa mostra l’immagine.',
    ),
  ).toBeDefined()
})
