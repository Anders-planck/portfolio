// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { NoteFigure } from './note-figure'

afterEach(cleanup)

const IMAGE = {
  src: 'https://example.com/cdn-cgi/image/width=780/https://media.example.com/chat.png',
  srcSet:
    'https://example.com/cdn-cgi/image/width=390/https://media.example.com/chat.png 390w',
  widthPx: 1440,
  heightPx: 900,
  alt: 'La chat di Bussola',
}

test('a figure shows its image with alt, variants, size and caption', async () => {
  renderAtPath(
    <NoteFigure
      image={IMAGE}
      caption={[{ kind: 'text', text: 'La chat', marks: [] }]}
    />,
    '/',
  )

  const figure = await screen.findByRole('figure')
  const image = screen.getByRole('img', { name: 'La chat di Bussola' })
  expect(figure.contains(image)).toBe(true)
  expect(image.getAttribute('srcset')).toBe(IMAGE.srcSet)
  expect(image.getAttribute('sizes')).not.toBeNull()
  expect(image.getAttribute('width')).toBe('1440')
  expect(image.getAttribute('height')).toBe('900')
  expect(screen.getByText('La chat')).toBeDefined()
})

test('without variants the original is the only source, and no caption is drawn when there is none', async () => {
  renderAtPath(
    <NoteFigure image={{ ...IMAGE, srcSet: null }} caption={[]} />,
    '/',
  )

  const image = await screen.findByRole('img', { name: 'La chat di Bussola' })
  expect(image.getAttribute('srcset')).toBeNull()
  expect(image.getAttribute('sizes')).toBeNull()
  expect(document.querySelector('figcaption')).toBeNull()
})
