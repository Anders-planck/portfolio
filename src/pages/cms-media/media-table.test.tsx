// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { CV_ENTRY, SCREENSHOT_ENTRY } from '../../entities/media/media.fixture'
import { MediaTable } from './media-table'

afterEach(cleanup)

test('each media shows its link, usage and alt status', () => {
  render(
    <MediaTable entries={[SCREENSHOT_ENTRY, CV_ENTRY]} onOpenAlt={vi.fn()} />,
  )

  expect(
    screen
      .getByRole('link', { name: 'cv-anders-planck.pdf' })
      .getAttribute('href'),
  ).toBe(CV_ENTRY.url)
  expect(screen.getByText('Profilo · CV · pubblicato')).toBeDefined()
  expect(screen.getByText('non usato')).toBeDefined()
  expect(screen.getByText('manca: EN, FR, DE')).toBeDefined()
  expect(screen.getByText('non serve')).toBeDefined()
})

test('only an image opens the alt editor', () => {
  const onOpenAlt = vi.fn()
  render(
    <MediaTable entries={[SCREENSHOT_ENTRY, CV_ENTRY]} onOpenAlt={onOpenAlt} />,
  )

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Testo alternativo di bussola-chat.png',
    }),
  )

  expect(onOpenAlt).toHaveBeenCalledWith(SCREENSHOT_ENTRY.mediaId)
  expect(
    screen.queryByRole('button', {
      name: 'Testo alternativo di cv-anders-planck.pdf',
    }),
  ).toBeNull()
})

test('an empty library says how to start', () => {
  render(<MediaTable entries={[]} onOpenAlt={vi.fn()} />)

  expect(
    screen.getByRole('heading', {
      name: 'Nessun media. Carica il primo file.',
    }),
  ).toBeDefined()
})
