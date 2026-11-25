// @vitest-environment happy-dom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { NewSourceDialog } from './new-source-dialog'

afterEach(cleanup)

type CreateMetric = Parameters<typeof NewSourceDialog>[0]['onCreateMetric']

function renderDialog(onCreateMetric: CreateMetric) {
  const onClose = vi.fn()
  render(<NewSourceDialog onClose={onClose} onCreateMetric={onCreateMetric} />)
  return { onClose }
}

function fillText(name: RegExp, value: string) {
  fireEvent.change(screen.getByRole('textbox', { name }), {
    target: { value },
  })
}

test('an npm source is created from the form and the dialog closes', async () => {
  const onCreateMetric = vi.fn<CreateMetric>(() =>
    Promise.resolve({ kind: 'created' }),
  )
  const { onClose } = renderDialog(onCreateMetric)

  fillText(/Chiave/, 'sdk-downloads')
  fillText(/Cosa misura/, 'download/anno SDK')
  fillText(/Pacchetto npm/, '@a-cube-io/ereceipts-js-sdk')
  fireEvent.click(screen.getByRole('button', { name: 'Crea fonte' }))

  await waitFor(() => {
    expect(onClose).toHaveBeenCalled()
  })
  expect(onCreateMetric).toHaveBeenCalledWith({
    key: 'sdk-downloads',
    label: 'download/anno SDK',
    format: 'count',
    source: {
      kind: 'npm',
      packageName: '@a-cube-io/ereceipts-js-sdk',
      cadence: 'daily',
    },
  })
})

test('a refused source shows each problem and stays open', async () => {
  const onCreateMetric = vi.fn<CreateMetric>(() =>
    Promise.resolve({
      kind: 'rejected',
      problems: [{ kind: 'key-taken' }, { kind: 'invalid-package' }],
    }),
  )
  const { onClose } = renderDialog(onCreateMetric)

  fireEvent.click(screen.getByRole('button', { name: 'Crea fonte' }))

  expect(await screen.findByText('Questa chiave esiste già.')).toBeDefined()
  expect(screen.getByText('Nome di pacchetto npm non valido.')).toBeDefined()
  expect(onClose).not.toHaveBeenCalled()
})

test('a lost connection says the source was not saved', async () => {
  const onCreateMetric = vi.fn<CreateMetric>(() =>
    Promise.reject(new Error('connection lost')),
  )
  renderDialog(onCreateMetric)

  fireEvent.click(screen.getByRole('button', { name: 'Crea fonte' }))

  expect(await screen.findByText('Fonte non salvata. Riprova.')).toBeDefined()
})
