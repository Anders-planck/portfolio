import { expect, test } from 'vitest'

import { PUBLISHED_AT } from './note.fixture'
import { toPublicationLabel } from './to-publication-label'

test('where a note stands reads in Italian with its date', () => {
  expect(toPublicationLabel({ kind: 'draft' })).toBe('Bozza')
  expect(
    toPublicationLabel({ kind: 'scheduled', scheduledAt: PUBLISHED_AT }),
  ).toMatch(/^Programmata · 24 nov 2026/)
  expect(
    toPublicationLabel({
      kind: 'published',
      publishedAt: PUBLISHED_AT,
      scheduledEditAt: null,
    }),
  ).toMatch(/^Pubblicata · 24 nov 2026/)
  expect(
    toPublicationLabel({
      kind: 'published',
      publishedAt: PUBLISHED_AT,
      scheduledEditAt: PUBLISHED_AT + 24 * 60 * 60 * 1000,
    }),
  ).toMatch(/^Pubblicata · 24 nov 2026.* · modifica programmata · 25 nov 2026/)
})
