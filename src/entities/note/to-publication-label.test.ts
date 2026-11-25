import { expect, test } from 'vitest'

import { PUBLISHED_AT } from './note.fixture'
import { toPublicationLabel } from './to-publication-label'

test('where a note stands reads in Italian with its date', () => {
  expect(toPublicationLabel({ kind: 'draft' })).toBe('Bozza')
  expect(
    toPublicationLabel({ kind: 'scheduled', scheduledAt: PUBLISHED_AT }),
  ).toMatch(/^Programmata · 24 nov 2026/)
  expect(
    toPublicationLabel({ kind: 'published', publishedAt: PUBLISHED_AT }),
  ).toMatch(/^Pubblicata · 24 nov 2026/)
})
