// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { NoteStructure } from './note-structure'

afterEach(cleanup)

test('the structure lists the sections and the length of the draft', () => {
  render(
    <NoteStructure
      outline={[
        { id: 'primo', label: 'Primo', level: 2 },
        { id: 'secondo', label: 'Secondo', level: 3 },
      ]}
      readingMinutes={7}
      wordCount={1180}
    />,
  )

  expect(screen.getAllByRole('listitem')).toHaveLength(2)
  expect(screen.getByText('7 min · 1.180 parole')).toBeDefined()
})

test('a draft without headings says so', () => {
  render(<NoteStructure outline={[]} readingMinutes={1} wordCount={0} />)

  expect(screen.getByText('Nessun titolo ancora.')).toBeDefined()
})
