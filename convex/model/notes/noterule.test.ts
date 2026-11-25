import { expect, test } from 'vitest'

import type { RuleContext } from '../content/rulecontext'
import type { Snapshot } from '../content/snapshot'
import { noteRule } from './noterule'
import { MAX_NOTES } from './tables'

const CONTEXT: RuleContext = {
  metricKeys: new Set(['sdk-downloads']),
  noteSlugClaims: [
    { key: 'note-a', slug: 'review-agenti' },
    { key: 'note-b', slug: 'altra-nota' },
  ],
  noteCount: 2,
}

function toNote({
  slug = 'review-agenti',
  body = 'Testo.',
  title = 'Titolo',
}: { slug?: string; body?: string; title?: string } = {}): Snapshot {
  return {
    collection: 'note',
    key: 'note-a',
    fields: { slug, topic: 'ai', linkedProjectKeys: [] },
    content: [{ locale: 'it', title, summary: 'Sintesi.', body }],
  }
}

function rulesOf(snapshot: Snapshot) {
  return noteRule(snapshot, CONTEXT).map(({ rule, severity, locale }) => ({
    rule,
    severity,
    locale,
  }))
}

test('a note the site can show has no findings', () => {
  expect(noteRule(toNote(), CONTEXT)).toEqual([])
})

test('a slug must be lowercase words joined by hyphens', () => {
  for (const slug of ['', 'Review', 'due parole', '-x', 'a--b']) {
    expect(rulesOf(toNote({ slug }))).toEqual([
      { rule: 'note-slug', severity: 'block', locale: null },
    ])
  }
})

test('two notes never share a slug', () => {
  expect(rulesOf(toNote({ slug: 'altra-nota' }))).toEqual([
    { rule: 'note-slug-taken', severity: 'block', locale: null },
  ])
})

test('a note needs an Italian title, and every translation a title', () => {
  expect(rulesOf(toNote({ title: ' ' }))).toEqual([
    { rule: 'note-title', severity: 'block', locale: 'it' },
  ])
  const englishOnly: Snapshot = {
    collection: 'note',
    key: 'note-a',
    fields: { slug: 'review-agenti', topic: 'ai', linkedProjectKeys: [] },
    content: [{ locale: 'en', title: 'Title', summary: '', body: '' }],
  }
  expect(rulesOf(englishOnly)).toEqual([
    { rule: 'note-title', severity: 'block', locale: 'it' },
  ])
})

test('directive problems in the body block, with their line', () => {
  const findings = noteRule(toNote({ body: 'Testo\n\n::video{}' }), CONTEXT)
  expect(findings).toMatchObject([
    {
      rule: 'note-unknown-directive',
      severity: 'block',
      field: 'body',
      locale: 'it',
      message: expect.stringContaining('line 3') as unknown,
    },
  ])
})

test('a metric directive must name an existing metric', () => {
  expect(rulesOf(toNote({ body: '::metric{key="sdk-downloads"}' }))).toEqual([])
  expect(rulesOf(toNote({ body: '::metric{key="missing"}' }))).toEqual([
    { rule: 'unknown-metric', severity: 'block', locale: 'it' },
  ])
})

test('a figure only warns until media exists', () => {
  expect(rulesOf(toNote({ body: '::figure{media="m1"}' }))).toEqual([
    { rule: 'note-figure-unavailable', severity: 'warn', locale: 'it' },
  ])
})

test('a note past the read cap blocks, so no list ever leaves one out', () => {
  expect(
    noteRule(toNote(), { ...CONTEXT, noteCount: MAX_NOTES + 1 }).map(
      (finding) => finding.rule,
    ),
  ).toEqual(['note-limit'])
})

test('other collections are not this rule’s business', () => {
  const profile: Snapshot = {
    collection: 'profile',
    key: 'main',
    fields: {
      name: '',
      email: '',
      links: [],
      isAvailable: false,
      skills: { frontend: '', backend: '', infra: '' },
    },
    content: [],
  }
  expect(noteRule(profile, CONTEXT)).toEqual([])
})
