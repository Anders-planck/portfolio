import { expect, test } from 'vitest'

import { numeralRule } from './numeralrule'
import { EMPTY_PROFILE_CONTENT_FIELDS, EMPTY_PROFILE_FIELDS } from './profile'
import { hasBlockingFinding, PUBLISH_RULES, runPublishRules } from './rules'
import type { Snapshot } from './snapshot'

function toProfileSnapshot(
  fields: Partial<Extract<Snapshot, { collection: 'profile' }>['fields']>,
  subtitle: string,
): Snapshot {
  return {
    collection: 'profile',
    key: 'main',
    fields: { ...EMPTY_PROFILE_FIELDS, ...fields },
    content: [{ ...EMPTY_PROFILE_CONTENT_FIELDS, locale: 'it', subtitle }],
  }
}

test('a figure in a localized prose field blocks with its field and locale', () => {
  expect(numeralRule(toProfileSnapshot({}, 'Da quasi 4 anni.'))).toEqual([
    {
      rule: 'free-numeral',
      severity: 'block',
      field: 'subtitle',
      locale: 'it',
      message: 'Free number "4": use a metric reference {{m:key}}',
    },
  ])
})

test('a figure in a shared prose field blocks with no locale', () => {
  const skills = { frontend: 'React 19', backend: '', infra: '' }

  expect(numeralRule(toProfileSnapshot({ skills }, ''))).toMatchObject([
    { rule: 'free-numeral', field: 'skills.frontend', locale: null },
  ])
})

test('metric references and years pass', () => {
  expect(
    numeralRule(toProfileSnapshot({}, '{{m:sdk-commits}} commit dal 2023.')),
  ).toEqual([])
})

test('addresses are not prose: digits in the email and links pass', () => {
  const snapshot = toProfileSnapshot(
    {
      email: 'owner2026@example.com',
      links: [{ label: 'LinkedIn', href: 'https://example.com/in/abc-53184' }],
    },
    '',
  )

  expect(numeralRule(snapshot)).toEqual([])
})

test('publish runs the free-numeral rule', () => {
  const findings = runPublishRules(
    [toProfileSnapshot({}, 'Da quasi 4 anni.')],
    PUBLISH_RULES,
    { metricKeys: new Set() },
  )

  expect(hasBlockingFinding(findings)).toBe(true)
})
