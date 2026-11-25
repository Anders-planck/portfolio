// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import type {
  ProfileContent,
  ProfileFields,
} from '../../entities/profile/profile-draft'
import { ProfileEditor } from './profile-editor'

afterEach(cleanup)

const FIELDS: ProfileFields = {
  name: 'Anders Planck',
  email: 'anders@example.com',
  links: [],
  isAvailable: false,
  skills: { frontend: 'React', backend: 'PHP', infra: 'Docker' },
}

const CONTENT: ProfileContent = {
  statusLabel: 'Software Engineer · Ferrara',
  availabilityLabel: 'Disponibile',
  titleLine1: 'Software',
  titleLine2: 'Engineer.',
  subtitle: 'Frontend e full-stack in TypeScript.',
  contactLabel: 'Scrivimi',
  languages: 'Italiano',
}

function renderEditor() {
  const onEdit = vi.fn()
  render(
    <ProfileEditor
      initialFields={FIELDS}
      initialContent={CONTENT}
      cvChoices={{ kind: 'ready', choices: [] }}
      onEdit={onEdit}
    />,
  )
  return onEdit
}

function typeInto(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

test('the form opens on the saved values', () => {
  renderEditor()

  expect(screen.getByLabelText<HTMLTextAreaElement>('Sottotitolo').value).toBe(
    CONTENT.subtitle,
  )
  expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe(
    FIELDS.email,
  )
})

test('a locale field edit is handed on as locale content', () => {
  const onEdit = renderEditor()

  typeInto('Titolo · riga 1', 'Senior')

  expect(onEdit).toHaveBeenCalledWith({ content: { titleLine1: 'Senior' } })
  expect(screen.getByLabelText<HTMLInputElement>('Titolo · riga 1').value).toBe(
    'Senior',
  )
})

test('shared fields are handed on as fields; skills go whole', () => {
  const onEdit = renderEditor()

  typeInto('Email', 'new@example.com')
  typeInto('Backend', 'Laravel')
  fireEvent.click(screen.getByLabelText('Mostra il pallino «disponibile»'))

  expect(onEdit).toHaveBeenCalledWith({ fields: { email: 'new@example.com' } })
  expect(onEdit).toHaveBeenCalledWith({
    fields: { skills: { ...FIELDS.skills, backend: 'Laravel' } },
  })
  expect(onEdit).toHaveBeenCalledWith({ fields: { isAvailable: true } })
})
