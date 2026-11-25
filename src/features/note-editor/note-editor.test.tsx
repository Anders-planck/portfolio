// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { EDITABLE_NOTE } from '../../entities/note/note-draft.fixture'
import { NoteEditor } from './note-editor'

afterEach(cleanup)

function renderEditor() {
  const onEdit = vi.fn()
  render(
    <NoteEditor
      initialFields={EDITABLE_NOTE.fields}
      initialContent={EDITABLE_NOTE.content}
      linkableProjects={[]}
      onEdit={onEdit}
    />,
  )
  return onEdit
}

test('each typed field becomes an edit of the locale copy or of the shared fields', () => {
  const onEdit = renderEditor()

  fireEvent.change(screen.getByLabelText('Testo in Markdown'), {
    target: { value: '## Nuovo' },
  })
  fireEvent.change(screen.getByLabelText('Slug'), {
    target: { value: 'nuovo' },
  })

  expect(onEdit).toHaveBeenNthCalledWith(1, { content: { body: '## Nuovo' } })
  expect(onEdit).toHaveBeenNthCalledWith(2, { fields: { slug: 'nuovo' } })
  expect(screen.getByLabelText('Testo in Markdown')).toHaveProperty(
    'value',
    '## Nuovo',
  )
})

test('the form opens on the saved values, the linked projects picker included', () => {
  renderEditor()

  expect(screen.getByLabelText('Titolo')).toHaveProperty(
    'value',
    'Cosa cerco nel codice di un agente',
  )
  expect(screen.getByText('Collegata a')).toBeDefined()
  expect(screen.getByText('Tema')).toBeDefined()
})
