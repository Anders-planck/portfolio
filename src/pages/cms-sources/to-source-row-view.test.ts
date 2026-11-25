import { expect, test } from 'vitest'

import { type SourceRow, toSourceRowViewFromRow } from './to-source-row-view'

const COUNTED_AT = Date.UTC(2026, 10, 23)

const MANUAL_ROW: SourceRow = {
  key: 'leco-test-files',
  label: 'file di test in LECO',
  format: 'at-least',
  source: { kind: 'manual' },
  display: '750+',
  verifiedAt: COUNTED_AT,
  evidence: 'Conteggio a mano',
  status: { kind: 'ok' },
}

const SEARCH_ROW: SourceRow = {
  key: 'merged-prs',
  label: 'PR mergiati',
  format: 'count',
  source: {
    kind: 'github-search',
    query: 'is:pr is:merged author:Anders-planck',
    needsToken: true,
    cadence: 'daily',
  },
  display: null,
  verifiedAt: null,
  evidence: null,
  status: {
    kind: 'failing',
    failedAt: Date.UTC(2026, 10, 24, 4),
    reason: { kind: 'missing-token' },
  },
}

test('a manual count reads as its evidence and day, refreshed by hand', () => {
  expect(toSourceRowViewFromRow(MANUAL_ROW)).toEqual({
    value: '750+',
    kind: 'manuale',
    origin: 'Conteggio a mano del 23 nov 2026',
    cadence: 'a mano',
    status: { tone: 'success', label: 'ok', detail: null },
  })
})

test('a failing private search shows no value, when it failed and why', () => {
  expect(toSourceRowViewFromRow(SEARCH_ROW)).toEqual({
    value: 'nessun valore',
    kind: 'GitHub API · token',
    origin: 'search: is:pr is:merged author:Anders-planck',
    cadence: 'ogni giorno',
    status: {
      tone: 'error',
      label: 'non risponde dal 24 nov 2026',
      detail: 'manca il token GitHub',
    },
  })
})

test('an expired manual count must be counted again', () => {
  const expired = {
    ...MANUAL_ROW,
    status: { kind: 'expired', expiredAt: Date.UTC(2027, 1, 21) },
  } as const

  expect(toSourceRowViewFromRow(expired).status).toEqual({
    tone: 'warning',
    label: 'da ricontare',
    detail: null,
  })
})

test('an HTTP failure names its status', () => {
  const failing = {
    ...SEARCH_ROW,
    status: {
      kind: 'failing',
      failedAt: Date.UTC(2026, 10, 24, 4),
      reason: { kind: 'http', status: 503 },
    },
  } as const

  expect(toSourceRowViewFromRow(failing).status.detail).toBe('errore HTTP 503')
})
