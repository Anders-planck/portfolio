// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { renderAtPath } from './render-at-path.fixture'
import { TranslationFallbackNotice } from './translation-fallback-notice'

afterEach(cleanup)

test('the notice speaks the reader’s locale and names the shown language in its own', async () => {
  renderAtPath(<TranslationFallbackNotice shownLocale="en" />, '/de/lavori')
  expect(
    await screen.findByText(
      'Diese Seite ist noch nicht übersetzt: du liest sie auf English.',
    ),
  ).toBeDefined()
})

test('on an Italian address it is in Italian', async () => {
  renderAtPath(<TranslationFallbackNotice shownLocale="it" />, '/lavori')
  expect(
    await screen.findByText(
      'Questa pagina non è ancora tradotta: la leggi in Italiano.',
    ),
  ).toBeDefined()
})
