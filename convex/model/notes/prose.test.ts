import { expect, test } from 'vitest'

import { parseNoteMarkdown } from './markdown'
import { listNoteMetricKeys, toProseTextsFromNoteBody } from './prose'

function prose(body: string) {
  return toProseTextsFromNoteBody(parseNoteMarkdown(body).blocks)
}

test('prose is what a reader reads: headings, paragraphs, items, quotes, labels', () => {
  expect(
    prose(
      [
        '## Titolo',
        'Vedi [il **sito**](https://example.com/v2).',
        '- voce',
        '> citata',
        ':::case{title="Il caso"}',
        'dentro',
        ':::',
        '::metric[etichetta]{key="sdk-downloads"}',
        '::figure[didascalia]{media="m1"}',
      ].join('\n'),
    ),
  ).toEqual([
    'Titolo',
    'Vedi il sito.',
    'voce',
    'citata',
    'Il caso',
    'dentro',
    'etichetta',
    'didascalia',
  ])
})

test('code, addresses and directive attributes are not prose', () => {
  expect(
    prose(
      'Usa `useState(0)` ora.\n\n```\nconst a = 42\n```\n::metric{key="k2"}',
    ),
  ).toEqual(['Usa  ora.'])
})

test('metric keys come from references in prose and from metric directives', () => {
  expect(
    listNoteMetricKeys(
      parseNoteMarkdown(
        'Ogni anno {{m:sdk-downloads}}.\n\n::metric{key="tests"}\n\n`{{m:in-code}}`',
      ).blocks,
    ),
  ).toEqual(['sdk-downloads', 'tests'])
})
