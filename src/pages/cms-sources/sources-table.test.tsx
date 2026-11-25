// @vitest-environment happy-dom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { SOURCES_OVERVIEW } from './sources.fixture'
import { SourcesTable } from './sources-table'

afterEach(cleanup)

function findRow(text: string) {
  const row = screen.getByText(text).closest('tr')
  if (row === null) {
    throw new Error(`No table row holds "${text}"`)
  }
  return within(row)
}

test('each metric shows its figure, reference, source, refresh and status', () => {
  render(
    <SourcesTable
      rows={SOURCES_OVERVIEW.metrics}
      onOpenManualCount={vi.fn()}
    />,
  )

  const row = findRow('download/anno SDK e-receipts')
  expect(row.getByText('8.489')).toBeDefined()
  expect(row.getByText('{{m:sdk-downloads}}')).toBeDefined()
  expect(row.getByText('npm API')).toBeDefined()
  expect(
    row.getByText(
      'api.npmjs.org/downloads/point/last-year/@a-cube-io/ereceipts-js-sdk',
    ),
  ).toBeDefined()
  expect(row.getByText('ogni giorno')).toBeDefined()
  expect(row.getByText('ok')).toBeDefined()
})

test('a metric without a verified reading shows no figure, never zero', () => {
  render(
    <SourcesTable
      rows={SOURCES_OVERVIEW.metrics}
      onOpenManualCount={vi.fn()}
    />,
  )

  const row = findRow('commit miei in expo-mutual-tls')
  expect(row.getByText('nessun valore')).toBeDefined()
  expect(row.queryByText('0')).toBeNull()
})

test('only a manual metric can record a count, with its evidence and day shown', () => {
  const onOpenManualCount = vi.fn()
  render(
    <SourcesTable
      rows={SOURCES_OVERVIEW.metrics}
      onOpenManualCount={onOpenManualCount}
    />,
  )

  const row = findRow('file di test in LECO')
  expect(row.getByText('Conteggio a mano del 23 nov 2026')).toBeDefined()
  fireEvent.click(
    row.getByRole('button', {
      name: 'Registra conteggio: file di test in LECO',
    }),
  )
  expect(onOpenManualCount).toHaveBeenCalledWith(
    expect.objectContaining({ key: 'leco-test-files' }),
  )
  expect(
    screen.getAllByRole('button', { name: /Registra conteggio/ }),
  ).toHaveLength(1)
})

test('with no metrics the table says how to add one', () => {
  render(<SourcesTable rows={[]} onOpenManualCount={vi.fn()} />)

  expect(
    screen.getByText('Nessuna fonte. Aggiungine una con «Nuova fonte».'),
  ).toBeDefined()
})
