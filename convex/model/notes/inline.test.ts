import { expect, test } from 'vitest'

import { isSafeHref, parseInline } from './inline'

test('plain text is one run without marks', () => {
  expect(parseInline('Uso gli agenti ogni giorno.')).toEqual([
    { kind: 'text', text: 'Uso gli agenti ogni giorno.', marks: [] },
  ])
})

test('strong and emphasis mark their runs, also nested', () => {
  expect(parseInline('a **forte e *molto* forte** _piano_ b')).toEqual([
    { kind: 'text', text: 'a ', marks: [] },
    { kind: 'text', text: 'forte e ', marks: ['strong'] },
    { kind: 'text', text: 'molto', marks: ['strong', 'emphasis'] },
    { kind: 'text', text: ' forte', marks: ['strong'] },
    { kind: 'text', text: ' ', marks: [] },
    { kind: 'text', text: 'piano', marks: ['emphasis'] },
    { kind: 'text', text: ' b', marks: [] },
  ])
})

test('an unclosed delimiter stays text', () => {
  expect(parseInline('un * da solo e **aperto')).toEqual([
    { kind: 'text', text: 'un * da solo e **aperto', marks: [] },
  ])
})

test('an underscore inside a word is not emphasis', () => {
  expect(parseInline('snake_case_name')).toEqual([
    { kind: 'text', text: 'snake_case_name', marks: [] },
  ])
})

test('inline code keeps its text as written, delimiters included', () => {
  expect(parseInline('usa `**non grassetto**` qui')).toEqual([
    { kind: 'text', text: 'usa ', marks: [] },
    { kind: 'code', text: '**non grassetto**' },
    { kind: 'text', text: ' qui', marks: [] },
  ])
})

test('a link to a safe address keeps its label runs', () => {
  expect(parseInline('vedi [il **sito**](https://example.com/a) ora')).toEqual([
    { kind: 'text', text: 'vedi ', marks: [] },
    {
      kind: 'link',
      href: 'https://example.com/a',
      children: [
        { kind: 'text', text: 'il ', marks: [] },
        { kind: 'text', text: 'sito', marks: ['strong'] },
      ],
    },
    { kind: 'text', text: ' ora', marks: [] },
  ])
})

test('site paths, anchors and mail addresses are safe links', () => {
  const hrefs = ['/lavori', '#metodo', 'mailto:a@example.com', 'http://a.it']
  for (const href of hrefs) {
    expect(parseInline(`[x](${href})`)).toEqual([
      {
        kind: 'link',
        href,
        children: [{ kind: 'text', text: 'x', marks: [] }],
      },
    ])
  }
})

test('a link to an unsafe address shows only its label', () => {
  for (const href of ['javascript:alert(1)', '//evil.example', 'data:text']) {
    expect(parseInline(`[clic](${href})`)).toEqual([
      { kind: 'text', text: 'clic', marks: [] },
    ])
  }
})

test('an address that browsers read as another host shows only its label', () => {
  const hrefs = [
    '/\\evil.example',
    '/\tevil',
    'https://ok.example/\\x',
    'http://',
  ]
  for (const href of hrefs) {
    expect(parseInline(`[clic](${href})`)).toEqual([
      { kind: 'text', text: 'clic', marks: [] },
    ])
  }
})

test('a site path stays on the site once resolved', () => {
  expect(isSafeHref('/lavori/../note#metodo')).toBe(true)
  expect(isSafeHref('/\nevil')).toBe(false)
  expect(isSafeHref('/\revil')).toBe(false)
})

test('raw HTML is text, never markup', () => {
  expect(parseInline('<img src=x onerror=alert(1)>')).toEqual([
    { kind: 'text', text: '<img src=x onerror=alert(1)>', marks: [] },
  ])
})

test('a backslash escapes a delimiter', () => {
  expect(parseInline('\\*non corsivo\\*')).toEqual([
    { kind: 'text', text: '*non corsivo*', marks: [] },
  ])
})

test('metric references stay in the text for the renderer', () => {
  expect(parseInline('**{{m:sdk-downloads}}** download')).toEqual([
    { kind: 'text', text: '{{m:sdk-downloads}}', marks: ['strong'] },
    { kind: 'text', text: ' download', marks: [] },
  ])
})
