import { expect, test } from 'vitest'

import { parseMetricReferences } from './references'

test('text without references is one text segment', () => {
  expect(parseMetricReferences('Frontend e full-stack.')).toEqual([
    { kind: 'text', text: 'Frontend e full-stack.' },
  ])
})

test('a reference splits the text around the metric key', () => {
  expect(
    parseMetricReferences('SDK: {{m:sdk-commits}} commit, a mano.'),
  ).toEqual([
    { kind: 'text', text: 'SDK: ' },
    { kind: 'reference', key: 'sdk-commits' },
    { kind: 'text', text: ' commit, a mano.' },
  ])
})

test('references next to each other and at both ends keep no empty text', () => {
  expect(parseMetricReferences('{{m:first}}{{m:second}}')).toEqual([
    { kind: 'reference', key: 'first' },
    { kind: 'reference', key: 'second' },
  ])
})

test('an empty text has no segments', () => {
  expect(parseMetricReferences('')).toEqual([])
})

test('a malformed reference stays text', () => {
  expect(parseMetricReferences('{{m:Not A Key}} {{m:}} {m:key}')).toEqual([
    { kind: 'text', text: '{{m:Not A Key}} {{m:}} {m:key}' },
  ])
})
