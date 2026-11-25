// @vitest-environment happy-dom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { SourcesSettings } from './sources-settings'

afterEach(cleanup)

type ChooseStyle = Parameters<
  typeof SourcesSettings
>[0]['onChooseLargeNumberStyle']

async function pickExactFigures() {
  fireEvent.click(screen.getByRole('combobox', { name: /Oltre diecimila/ }))
  fireEvent.click(
    await screen.findByRole('option', { name: 'Mostra il numero esatto' }),
  )
}

test('whether the GitHub token is set is shown, never the token', () => {
  render(
    <SourcesSettings
      isGithubTokenSet={false}
      largeNumberStyle="compact"
      onChooseLargeNumberStyle={vi.fn<ChooseStyle>()}
    />,
  )

  expect(screen.getByText('non configurato')).toBeDefined()
})

test('the rounding choice is saved when the owner picks it', async () => {
  const onChooseLargeNumberStyle = vi.fn<ChooseStyle>(() => Promise.resolve())
  render(
    <SourcesSettings
      isGithubTokenSet
      largeNumberStyle="compact"
      onChooseLargeNumberStyle={onChooseLargeNumberStyle}
    />,
  )

  await pickExactFigures()

  await waitFor(() => {
    expect(onChooseLargeNumberStyle).toHaveBeenCalledWith('exact')
  })
})

test('a rounding choice that was not saved says so', async () => {
  render(
    <SourcesSettings
      isGithubTokenSet
      largeNumberStyle="compact"
      onChooseLargeNumberStyle={vi.fn<ChooseStyle>(() =>
        Promise.reject(new Error('offline')),
      )}
    />,
  )

  await pickExactFigures()

  expect(await screen.findByText('Scelta non salvata. Riprova.')).toBeDefined()
})
