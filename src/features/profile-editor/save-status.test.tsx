// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { SaveStatus } from './save-status'

afterEach(cleanup)

test('a saved draft shows "Salvato · hh:mm" in a status region', () => {
  const savedAt = new Date(2026, 10, 25, 9, 5).getTime()
  render(<SaveStatus saveState={{ kind: 'saved', savedAt }} onRetry={vi.fn()} />)

  expect(screen.getByRole('status').textContent).toBe('Salvato · 09:05')
})

test('every other state says where the edits are', () => {
  const { rerender } = render(
    <SaveStatus saveState={{ kind: 'saved', savedAt: null }} onRetry={vi.fn()} />,
  )
  expect(screen.getByRole('status').textContent).toBe('Nessuna bozza salvata')

  rerender(<SaveStatus saveState={{ kind: 'unsaved' }} onRetry={vi.fn()} />)
  expect(screen.getByRole('status').textContent).toBe('Modifiche da salvare…')

  rerender(<SaveStatus saveState={{ kind: 'saving' }} onRetry={vi.fn()} />)
  expect(screen.getByRole('status').textContent).toBe('Salvataggio…')
  expect(screen.queryByRole('button', { name: 'Riprova' })).toBeNull()
})

test('a failed save offers a retry', () => {
  const onRetry = vi.fn()
  render(<SaveStatus saveState={{ kind: 'failed' }} onRetry={onRetry} />)

  expect(screen.getByText('Salvataggio non riuscito')).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: 'Riprova' }))
  expect(onRetry).toHaveBeenCalledOnce()
})
