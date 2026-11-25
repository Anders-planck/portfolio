// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { toPlainRuns } from './note.fixture'
import { NoteBody } from './note-body'

afterEach(cleanup)

test('headings and cases carry the anchors the Outline links to', async () => {
  renderAtPath(
    <NoteBody
      locale="it"
      blocks={[
        {
          kind: 'heading',
          level: 2,
          id: 'primo',
          inlines: toPlainRuns('Primo'),
        },
        {
          kind: 'case',
          id: 'il-metodo',
          title: toPlainRuns('Il metodo'),
          blocks: [{ kind: 'paragraph', inlines: toPlainRuns('Dentro.') }],
        },
      ]}
    />,
    '/',
  )

  expect((await screen.findByRole('heading', { name: 'Primo' })).id).toBe(
    'primo',
  )
  expect(document.getElementById('il-metodo')?.textContent).toContain('Dentro.')
})

test('lists, quotes and code render as such', async () => {
  renderAtPath(
    <NoteBody
      locale="it"
      blocks={[
        {
          kind: 'list',
          isOrdered: true,
          items: [toPlainRuns('uno'), toPlainRuns('due')],
        },
        { kind: 'quote', paragraphs: [toPlainRuns('citata')] },
        { kind: 'code', language: 'ts', text: 'const answer = 42' },
      ]}
    />,
    '/',
  )

  expect(await screen.findAllByRole('listitem')).toHaveLength(2)
  expect(screen.getByText('citata').closest('blockquote')).not.toBeNull()
  expect(screen.getByText(/const answer/)).toBeDefined()
})

test('a metric block shows its figure, label and verification date', async () => {
  renderAtPath(
    <NoteBody
      locale="it"
      blocks={[
        {
          kind: 'metric',
          key: 'sdk-downloads',
          label: toPlainRuns('download in un anno'),
          reading: { text: '8.489', verifiedAt: Date.UTC(2026, 10, 20, 11) },
        },
        {
          kind: 'metric',
          key: 'never-read',
          label: toPlainRuns('mai letto'),
          reading: null,
        },
      ]}
    />,
    '/',
  )

  expect(await screen.findByText('8.489')).toBeDefined()
  expect(screen.getByText('verificato il 20 nov 2026')).toBeDefined()
  expect(screen.getByText('dato non disponibile')).toBeDefined()
})
