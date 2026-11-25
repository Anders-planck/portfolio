import { expect, test } from 'vitest'

import { EMPTY_PROFILE_CONTENT_FIELDS, EMPTY_PROFILE_FIELDS } from './profile'
import { hasBlockingFinding, type Rule, runPublishRules } from './rules'
import type { Snapshot } from './snapshot'

const SNAPSHOT: Snapshot = {
  collection: 'profile',
  key: 'main',
  fields: EMPTY_PROFILE_FIELDS,
  content: [{ ...EMPTY_PROFILE_CONTENT_FIELDS, locale: 'en' }],
}

const NO_METRICS = {
  metricKeys: new Set<string>(),
  noteSlugClaims: [],
  noteCount: 0,
  media: new Map(),
}

const emptySubtitleRule: Rule = (snapshot) =>
  (snapshot.collection === 'profile' ? snapshot.content : [])
    .filter((record) => record.subtitle === '')
    .map((record) => ({
      rule: 'empty-subtitle',
      severity: 'warn',
      field: 'subtitle',
      locale: record.locale,
      message: 'Subtitle is empty',
    }))

test('with no rules nothing is found', () => {
  expect(runPublishRules([SNAPSHOT], [], NO_METRICS)).toEqual([])
})

test('findings are tagged with the document they are about', () => {
  expect(runPublishRules([SNAPSHOT], [emptySubtitleRule], NO_METRICS)).toEqual([
    {
      collection: 'profile',
      key: 'main',
      rule: 'empty-subtitle',
      severity: 'warn',
      field: 'subtitle',
      locale: 'en',
      message: 'Subtitle is empty',
    },
  ])
})

test('only a block finding stops a publish', () => {
  const warning = {
    collection: 'profile',
    key: 'main',
    rule: 'empty-subtitle',
    severity: 'warn',
    field: 'subtitle',
    locale: 'en',
    message: 'Subtitle is empty',
  } as const

  expect(hasBlockingFinding([warning])).toBe(false)
  expect(hasBlockingFinding([warning, { ...warning, severity: 'block' }])).toBe(
    true,
  )
})
