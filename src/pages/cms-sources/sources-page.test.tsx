// @vitest-environment happy-dom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { SOURCES_OVERVIEW } from './sources.fixture'
import { SourcesPage, type SourcesPageProps } from './sources-page'

afterEach(cleanup)

function renderPage(overrides: Partial<SourcesPageProps> = {}) {
  const props: SourcesPageProps = {
    overview: SOURCES_OVERVIEW,
    onRefreshNow: vi.fn(() => Promise.resolve()),
    onCreateMetric: vi.fn(() => Promise.resolve({ kind: 'created' } as const)),
    onRecordManualCount: vi.fn(() =>
      Promise.resolve({ kind: 'recorded' } as const),
    ),
    onChooseLargeNumberStyle: vi.fn(() => Promise.resolve()),
    ...overrides,
  }
  render(<SourcesPage {...props} />)
  return props
}

test('Fonti lists the metrics and the settings under one heading', () => {
  renderPage()

  expect(
    screen.getByRole('heading', { level: 1, name: 'Fonti dei numeri' }),
  ).toBeDefined()
  expect(screen.getByText('download/anno SDK e-receipts')).toBeDefined()
  expect(screen.getByRole('heading', { name: 'Arrotondamenti' })).toBeDefined()
})

test('"Aggiorna ora" reads the sources and says so when it fails', async () => {
  const onRefreshNow = vi.fn(() => Promise.reject(new Error('offline')))
  renderPage({ onRefreshNow })

  fireEvent.click(screen.getByRole('button', { name: 'Aggiorna ora' }))

  expect(
    await screen.findByText('Aggiornamento non riuscito. Riprova.'),
  ).toBeDefined()
  expect(onRefreshNow).toHaveBeenCalledTimes(1)
})

test('a recorded manual count closes its dialog', async () => {
  const props = renderPage()

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Registra conteggio: file di test in LECO',
    }),
  )
  const value = await screen.findByRole('spinbutton', {
    name: /Valore contato/,
  })
  fireEvent.change(value, { target: { value: '760' } })
  fireEvent.blur(value)
  fireEvent.click(screen.getByRole('button', { name: 'Registra' }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  expect(props.onRecordManualCount).toHaveBeenCalledWith(
    expect.objectContaining({ key: 'leco-test-files', value: 760 }),
  )
})

test('"Nuova fonte" opens the source form', async () => {
  renderPage()

  fireEvent.click(screen.getByRole('button', { name: 'Nuova fonte' }))

  expect(await screen.findByRole('textbox', { name: /Chiave/ })).toBeDefined()
})
