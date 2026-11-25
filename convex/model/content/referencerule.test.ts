import { expect, test } from 'vitest'

import { EMPTY_PROFILE_CONTENT_FIELDS, EMPTY_PROFILE_FIELDS } from './profile'
import { referenceRule } from './referencerule'
import type { Snapshot } from './snapshot'

const CONTEXT = {
  metricKeys: new Set(['sdk-commits']),
  noteSlugClaims: [],
  noteCount: 0,
}

function toProfileSnapshot(subtitle: string): Snapshot {
  return {
    collection: 'profile',
    key: 'main',
    fields: EMPTY_PROFILE_FIELDS,
    content: [{ ...EMPTY_PROFILE_CONTENT_FIELDS, locale: 'it', subtitle }],
  }
}

test('a reference to an existing metric passes', () => {
  expect(
    referenceRule(toProfileSnapshot('{{m:sdk-commits}} commit'), CONTEXT),
  ).toEqual([])
})

test('a reference to a metric that does not exist blocks', () => {
  expect(
    referenceRule(toProfileSnapshot('{{m:leco-commits}} commit'), CONTEXT),
  ).toEqual([
    {
      rule: 'unknown-metric',
      severity: 'block',
      field: 'subtitle',
      locale: 'it',
      message: 'No metric "leco-commits"',
    },
  ])
})

test('a malformed reference blocks', () => {
  expect(
    referenceRule(
      toProfileSnapshot('{{ m:sdk-commits }} e {{M:sdk}}'),
      CONTEXT,
    ),
  ).toMatchObject([
    {
      rule: 'malformed-metric-reference',
      severity: 'block',
      field: 'subtitle',
    },
    {
      rule: 'malformed-metric-reference',
      severity: 'block',
      field: 'subtitle',
    },
  ])
})

test('references in a note body are checked like any prose', () => {
  const note: Snapshot = {
    collection: 'note',
    key: 'note-a',
    fields: { slug: 'nota', topic: 'ai', linkedProjectKeys: [] },
    content: [
      {
        locale: 'it',
        title: '{{m:sdk-commits}} commit',
        summary: '',
        body: '## Con {{m:leco-commits}}\n\nE {{ m:sdk }} qui. `{{m:in-code}}`',
      },
    ],
  }

  expect(
    referenceRule(note, CONTEXT).map(({ rule, field }) => [rule, field]),
  ).toEqual([
    ['unknown-metric', 'body'],
    ['malformed-metric-reference', 'body'],
  ])
})
