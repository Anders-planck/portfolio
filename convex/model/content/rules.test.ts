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

const emptySubtitleRule: Rule = (snapshot) =>
  snapshot.content
    .filter((record) => record.subtitle === '')
    .map((record) => ({
      rule: 'empty-subtitle',
      severity: 'warn',
      field: 'subtitle',
      locale: record.locale,
      message: 'Subtitle is empty',
    }))

test('the server rule set starts empty, so nothing is found', () => {
  expect(runPublishRules([SNAPSHOT])).toEqual([])
})

test('findings are tagged with the document they are about', () => {
  expect(runPublishRules([SNAPSHOT], [emptySubtitleRule])).toEqual([
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
