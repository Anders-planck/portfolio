import { expect, test } from 'vitest'

import type { RenderableMetric } from '../metrics/render'
import { parseNoteMarkdown } from './markdown'
import { renderNoteBody } from './render'

const VERIFIED_AT = Date.UTC(2026, 10, 20)

const METRICS: ReadonlyMap<string, RenderableMetric> = new Map([
  [
    'sdk-downloads',
    {
      format: 'count',
      reading: {
        figure: { value: 8489, total: null },
        verifiedAt: VERIFIED_AT,
      },
    },
  ],
  ['never-read', { format: 'count', reading: null }],
])

function render(body: string, locale: 'it' | 'en' = 'it') {
  return renderNoteBody(parseNoteMarkdown(body).blocks, {
    metrics: METRICS,
    locale,
    style: 'exact',
  })
}

test('a metric reference becomes its verified figure in the page locale', () => {
  expect(render('Ogni anno **{{m:sdk-downloads}}** download.').blocks).toEqual([
    {
      kind: 'paragraph',
      inlines: [
        { kind: 'text', text: 'Ogni anno ', marks: [] },
        {
          kind: 'metric',
          key: 'sdk-downloads',
          text: '8.489',
          verifiedAt: VERIFIED_AT,
          marks: ['strong'],
        },
        { kind: 'text', text: ' download.', marks: [] },
      ],
    },
  ])
  expect(render('{{m:sdk-downloads}}', 'en').blocks).toMatchObject([
    { inlines: [{ text: '8,489' }] },
  ])
})

test('a metric without a verified figure is unavailable, never zero', () => {
  expect(render('[{{m:never-read}}](/lavori)').blocks).toEqual([
    {
      kind: 'paragraph',
      inlines: [
        {
          kind: 'link',
          href: '/lavori',
          children: [{ kind: 'unavailable', key: 'never-read', marks: [] }],
        },
      ],
    },
  ])
})

test('the metric directive carries the reading and its date', () => {
  expect(render('::metric[download]{key="sdk-downloads"}').blocks).toEqual([
    {
      kind: 'metric',
      key: 'sdk-downloads',
      label: [{ kind: 'text', text: 'download', marks: [] }],
      reading: { text: '8.489', verifiedAt: VERIFIED_AT },
    },
  ])
  expect(render('::metric{key="missing-key"}').blocks).toMatchObject([
    { kind: 'metric', reading: null },
  ])
})

test('figures render nothing until media exists (ticket 12)', () => {
  expect(render('::figure[Schema]{media="m1"}\n\nDopo').blocks).toEqual([
    {
      kind: 'paragraph',
      inlines: [{ kind: 'text', text: 'Dopo', marks: [] }],
    },
  ])
})

test('the outline lists headings and cases by anchor, in reading order', () => {
  expect(
    render('## Primo\n### Dentro\n:::case{title="Il metodo"}\nx\n:::').outline,
  ).toEqual([
    { id: 'primo', label: 'Primo', level: 2 },
    { id: 'dentro', label: 'Dentro', level: 3 },
    { id: 'il-metodo', label: 'Il metodo', level: 2 },
  ])
})

test('reading time counts the words a reader reads, at least a minute', () => {
  const words = Array.from({ length: 361 }, () => 'parola').join(' ')
  expect(render(words).readingMinutes).toBe(3)
  expect(render('Breve.').readingMinutes).toBe(1)
  expect(render('```\nnon conta nel tempo di lettura\n```').wordCount).toBe(0)
})
