// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import {
  MEDIA_LIMITS,
  SCREENSHOT_ENTRY,
} from '../../entities/media/media.fixture'
import type { MediaLibrary } from '../../entities/media/media-library-query-options'
import { MediaPage } from './media-page'

afterEach(cleanup)

const LIBRARY: MediaLibrary = {
  isStorageConfigured: true,
  hasImageVariants: false,
  limits: MEDIA_LIMITS,
  media: [SCREENSHOT_ENTRY],
}

function renderPage(library: MediaLibrary, onSaveAlt = vi.fn()) {
  render(
    <MediaPage
      library={library}
      onCreateUploadUrl={vi.fn()}
      onCompleteUpload={vi.fn()}
      onSaveAlt={onSaveAlt}
    />,
  )
}

test('without storage the page says so and uploads are off', () => {
  renderPage({ ...LIBRARY, isStorageConfigured: false })

  expect(screen.getByText('Archivio R2 non configurato')).toBeDefined()
})

test('without transformations the page says images are served as uploaded', () => {
  renderPage(LIBRARY)

  expect(screen.getByText(/Le varianti AVIF\/WebP si attivano/)).toBeDefined()
})

test('the alt editor saves the alt of the image it was opened for', async () => {
  const onSaveAlt = vi.fn(() => Promise.resolve({ savedAt: 1 }))
  renderPage(LIBRARY, onSaveAlt)

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Testo alternativo di bussola-chat.png',
    }),
  )
  const english = await screen.findByRole('textbox', { name: 'Alt · English' })
  fireEvent.change(english, { target: { value: 'Bussola chat' } })
  fireEvent.blur(english)

  expect(await screen.findByText('Salvato')).toBeDefined()
  expect(onSaveAlt).toHaveBeenCalledWith({
    mediaId: SCREENSHOT_ENTRY.mediaId,
    locale: 'en',
    alt: 'Bussola chat',
  })
})
