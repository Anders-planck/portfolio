// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { NoteChecks } from './note-checks'

afterEach(cleanup)

const FINDING = {
  field: 'slug',
  locale: null,
  message: 'diagnostic',
  collection: 'note' as const,
  key: 'note-a',
}

test('blocking and warning findings are worded, with field and language', () => {
  render(
    <NoteChecks
      findings={[
        { ...FINDING, rule: 'note-slug-taken', severity: 'block' },
        { ...FINDING, rule: 'some-new-rule', severity: 'warn', locale: 'de' },
      ]}
    />,
  )

  expect(screen.getByText('Un’altra nota usa già questo slug.')).toBeDefined()
  expect(screen.getByText('Slug · tutte le lingue')).toBeDefined()
  expect(screen.getByText('Regola non rispettata: some-new-rule')).toBeDefined()
  expect(screen.getByText('Slug · DE')).toBeDefined()
})

test('a draft that breaks no rule can be published', () => {
  render(<NoteChecks findings={[]} />)

  expect(
    screen.getByText('Nessun problema: la nota si può pubblicare.'),
  ).toBeDefined()
})
