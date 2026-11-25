// @vitest-environment happy-dom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { ManualCountDialog } from './manual-count-dialog'

afterEach(cleanup)

type RecordManualCount = Parameters<
  typeof ManualCountDialog
>[0]['onRecordManualCount']

function renderDialog(onRecordManualCount: RecordManualCount) {
  const onClose = vi.fn()
  render(
    <ManualCountDialog
      metricKey="leco-test-files"
      metricLabel="file di test in LECO"
      onClose={onClose}
      onRecordManualCount={onRecordManualCount}
    />,
  )
  return { onClose }
}

function typeCount(text: string) {
  const input = screen.getByRole('spinbutton', { name: /Valore contato/ })
  fireEvent.change(input, { target: { value: text } })
  fireEvent.blur(input)
}

test('a count is recorded with its evidence and the dialog closes', async () => {
  const onRecordManualCount = vi.fn<RecordManualCount>(() =>
    Promise.resolve({ kind: 'recorded' }),
  )
  const { onClose } = renderDialog(onRecordManualCount)

  typeCount('750')
  fireEvent.change(screen.getByRole('textbox', { name: /Prova/ }), {
    target: { value: 'Conteggio a mano' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Registra' }))

  await waitFor(() => {
    expect(onClose).toHaveBeenCalled()
  })
  expect(onRecordManualCount).toHaveBeenCalledWith(
    expect.objectContaining({
      key: 'leco-test-files',
      value: 750,
      evidence: 'Conteggio a mano',
    }),
  )
})

test('a refused count shows why and keeps the dialog open', async () => {
  const onRecordManualCount = vi.fn<RecordManualCount>(() =>
    Promise.resolve({
      kind: 'rejected',
      problems: [{ kind: 'missing-evidence' }],
    }),
  )
  const { onClose } = renderDialog(onRecordManualCount)

  typeCount('750')
  fireEvent.click(screen.getByRole('button', { name: 'Registra' }))

  expect(await screen.findByText('Scrivi come l’hai contato.')).toBeDefined()
  expect(onClose).not.toHaveBeenCalled()
})

test('an empty count is refused before it is sent', async () => {
  const onRecordManualCount = vi.fn<RecordManualCount>()
  renderDialog(onRecordManualCount)

  fireEvent.click(screen.getByRole('button', { name: 'Registra' }))

  expect(
    await screen.findByText('Serve un numero intero, zero o più.'),
  ).toBeDefined()
  expect(onRecordManualCount).not.toHaveBeenCalled()
})

test('a lost connection says the count was not saved', async () => {
  const onRecordManualCount = vi.fn<RecordManualCount>(() =>
    Promise.reject(new Error('connection lost')),
  )
  renderDialog(onRecordManualCount)

  typeCount('750')
  fireEvent.click(screen.getByRole('button', { name: 'Registra' }))

  expect(
    await screen.findByText('Conteggio non salvato. Riprova.'),
  ).toBeDefined()
})
