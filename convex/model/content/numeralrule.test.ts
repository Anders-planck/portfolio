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
    {
      metricKeys: new Set(),
      noteSlugClaims: [],
      noteCount: 0,
      media: new Map(),
    },
  )

  expect(hasBlockingFinding(findings)).toBe(true)
})

function toNoteSnapshot(content: {
  title?: string
  summary?: string
  body?: string
}): Snapshot {
  return {
    collection: 'note',
    key: 'note-a',
    fields: { slug: 'nota-2026', topic: 'ai', linkedProjectKeys: ['p1'] },
    content: [{ locale: 'en', title: '', summary: '', body: '', ...content }],
  }
}

test('note prose is checked: title, summary and the text of the body', () => {
  const snapshot = toNoteSnapshot({
    title: 'Five errors, not 5',
    summary: 'A 360 view',
    body: '## Step 1\n\nAbout 40 tests.\n\n- item 2\n\n> quote 3\n\n:::case{title="Case 4"}\nin 6\n:::',
  })

  expect(
    numeralRule(snapshot).map(({ field, locale, message }) => [
      field,
      locale,
      /"(.+)"/.exec(message)?.[1],
    ]),
  ).toEqual([
    ['title', 'en', '5'],
    ['summary', 'en', '360'],
    ['body', 'en', '1'],
    ['body', 'en', '40'],
    ['body', 'en', '2'],
    ['body', 'en', '3'],
    ['body', 'en', '4'],
    ['body', 'en', '6'],
  ])
})

test('code, link addresses, list markers and note fields are not prose', () => {
  const snapshot = toNoteSnapshot({
    body: '1. Use `useState(0)` and [the docs](https://example.com/v18).\n\n```\nconst port = 3210\n```\n\n::metric{key="sdk-2"}',
  })

  expect(numeralRule(snapshot)).toEqual([])
})
