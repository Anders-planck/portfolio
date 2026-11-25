// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { NoteRuns } from './note-runs'

afterEach(cleanup)

test('runs render their text, figures, code and links, never markup', async () => {
  renderAtPath(
    <NoteRuns
      runs={[
        { kind: 'text', text: '<b>non grassetto</b> ', marks: [] },
        { kind: 'text', text: 'forte', marks: ['strong'] },
        { kind: 'metric', key: 'k', text: '8.489', verifiedAt: 0, marks: [] },
        { kind: 'code', text: 'useState' },
        {
          kind: 'link',
          href: '/lavori',
          children: [{ kind: 'text', text: 'i lavori', marks: [] }],
        },
      ]}
    />,
    '/',
  )

  expect(await screen.findByText(/<b>non grassetto<\/b>/)).toBeDefined()
  expect(document.querySelector('b')).toBeNull()
  expect(document.body.textContent).toContain('8.489')
  expect(screen.getByText('useState').tagName).toBe('CODE')
  expect(
    screen.getByRole('link', { name: 'i lavori' }).getAttribute('href'),
  ).toBe('/lavori')
})

test('a metric without a verified figure says so in the page language', async () => {
  renderAtPath(
    <NoteRuns runs={[{ kind: 'unavailable', key: 'k', marks: [] }]} />,
    '/en',
  )

  expect(await screen.findByText('figure unavailable')).toBeDefined()
})
