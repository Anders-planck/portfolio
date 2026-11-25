// @vitest-environment happy-dom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { SourceFormDialog } from './source-form-dialog'

afterEach(cleanup)

function renderDialog(
  errors: string[],
  onSubmit = vi.fn(() => Promise.resolve()),
) {
  const onClose = vi.fn()
  render(
    <SourceFormDialog
      title="Nuova fonte"
      cancelLabel="Annulla"
      submitLabel="Crea fonte"
      errors={errors}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      field
    </SourceFormDialog>,
  )
  return { onClose, onSubmit }
}

test('the dialog shows its title, fields and each error', () => {
  renderDialog(['Questa chiave esiste già.'])

  expect(screen.getByRole('dialog')).toBeDefined()
  expect(screen.getByText('Nuova fonte')).toBeDefined()
  expect(screen.getByText('field')).toBeDefined()
  expect(screen.getByText('Questa chiave esiste già.')).toBeDefined()
})

test('submit runs once per click, and cancel closes', async () => {
  const { onClose, onSubmit } = renderDialog([])

  fireEvent.click(screen.getByRole('button', { name: 'Crea fonte' }))
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
  fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
  expect(onClose).toHaveBeenCalled()
})
