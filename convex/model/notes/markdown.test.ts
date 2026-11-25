import { describe, expect, test } from 'vitest'

import { parseNoteMarkdown } from './markdown'

function plain(text: string) {
  return [{ kind: 'text', text, marks: [] }]
}

describe('blocks', () => {
  test('paragraphs are split by blank lines and join their lines', () => {
    expect(
      parseNoteMarkdown('Prima riga\nseconda riga\n\nAltro').blocks,
    ).toEqual([
      { kind: 'paragraph', inlines: plain('Prima riga seconda riga') },
      { kind: 'paragraph', inlines: plain('Altro') },
    ])
  })

  test('headings get a unique anchor; # and #### fold into the two levels', () => {
    const { blocks } = parseNoteMarkdown(
      '# Perché leggere il diff\n## Il metodo\n### Il metodo\n#### Dettagli',
    )
    expect(blocks).toEqual([
      {
        kind: 'heading',
        level: 2,
        id: 'perche-leggere-il-diff',
        inlines: plain('Perché leggere il diff'),
      },
      {
        kind: 'heading',
        level: 2,
        id: 'il-metodo',
        inlines: plain('Il metodo'),
      },
      {
        kind: 'heading',
        level: 3,
        id: 'il-metodo-2',
        inlines: plain('Il metodo'),
      },
      { kind: 'heading', level: 3, id: 'dettagli', inlines: plain('Dettagli') },
    ])
  })

  test('lists keep their items; a following line continues the item', () => {
    const { blocks } = parseNoteMarkdown(
      '- uno\n  ancora\n- due\n\n1. primo\n2) secondo',
    )
    expect(blocks).toEqual([
      {
        kind: 'list',
        isOrdered: false,
        items: [plain('uno ancora'), plain('due')],
      },
      {
        kind: 'list',
        isOrdered: true,
        items: [plain('primo'), plain('secondo')],
      },
    ])
  })

  test('a quote holds paragraphs', () => {
    const { blocks } = parseNoteMarkdown(
      '> **In una frase:** veloce\n>\n> fine',
    )
    expect(blocks).toEqual([
      {
        kind: 'quote',
        paragraphs: [
          [
            { kind: 'text', text: 'In una frase:', marks: ['strong'] },
            { kind: 'text', text: ' veloce', marks: [] },
          ],
          plain('fine'),
        ],
      },
    ])
  })

  test('a fenced code block keeps its lines and language as written', () => {
    const { blocks } = parseNoteMarkdown('```ts\nconst a = 1\n\n## no\n```')
    expect(blocks).toEqual([
      { kind: 'code', language: 'ts', text: 'const a = 1\n\n## no' },
    ])
  })

  test('an unclosed fence still renders to the end of the note', () => {
    expect(parseNoteMarkdown('```\nx').blocks).toEqual([
      { kind: 'code', language: null, text: 'x' },
    ])
  })

  test('an empty note has no blocks and no problems', () => {
    expect(parseNoteMarkdown('  \n\n')).toEqual({ blocks: [], problems: [] })
  })
})

describe('directives', () => {
  test('a case is an anchored box with a title and simple blocks', () => {
    const { blocks, problems } = parseNoteMarkdown(
      ':::case{title="Il metodo"}\nChi scrive non rivede.\n\n- uno\n:::',
    )
    expect(problems).toEqual([])
    expect(blocks).toEqual([
      {
        kind: 'case',
        id: 'il-metodo',
        title: plain('Il metodo'),
        blocks: [
          { kind: 'paragraph', inlines: plain('Chi scrive non rivede.') },
          { kind: 'list', isOrdered: false, items: [plain('uno')] },
        ],
      },
    ])
  })

  test('a metric names its key and carries a label', () => {
    expect(
      parseNoteMarkdown('::metric[download in un anno]{key="sdk-downloads"}'),
    ).toEqual({
      blocks: [
        {
          kind: 'metric',
          key: 'sdk-downloads',
          label: plain('download in un anno'),
        },
      ],
      problems: [],
    })
  })

  test('a figure names its media and carries a caption', () => {
    expect(parseNoteMarkdown('::figure[Lo schema]{media="m1"}').blocks).toEqual(
      [{ kind: 'figure', mediaId: 'm1', caption: plain('Lo schema') }],
    )
  })

  test('an unknown directive is a problem and renders nothing', () => {
    expect(parseNoteMarkdown('testo\n\n::video{src="x"}')).toEqual({
      blocks: [{ kind: 'paragraph', inlines: plain('testo') }],
      problems: [{ kind: 'unknown-directive', name: 'video', line: 3 }],
    })
  })

  test('a directive without its required attribute is a problem', () => {
    expect(parseNoteMarkdown('::metric[x]{}\n::figure').problems).toEqual([
      { kind: 'missing-attribute', name: 'metric', attribute: 'key', line: 1 },
      {
        kind: 'missing-attribute',
        name: 'figure',
        attribute: 'media',
        line: 2,
      },
    ])
  })

  test('a metric key that is not a metric key is a problem', () => {
    expect(
      parseNoteMarkdown('::metric{key="Non Una Chiave"}').problems,
    ).toEqual([
      { kind: 'missing-attribute', name: 'metric', attribute: 'key', line: 1 },
    ])
  })

  test('attributes that do not parse are a problem', () => {
    expect(parseNoteMarkdown('::metric{key=sdk}').problems).toEqual([
      { kind: 'malformed-directive', name: 'metric', line: 1 },
    ])
  })

  test('a case left open is a problem and keeps its content', () => {
    const { blocks, problems } = parseNoteMarkdown(':::case{title="A"}\ntesto')
    expect(problems).toEqual([
      { kind: 'unclosed-directive', name: 'case', line: 1 },
    ])
    expect(blocks).toHaveLength(1)
  })

  test('directives and headings inside a case are problems', () => {
    const { problems } = parseNoteMarkdown(
      ':::case{title="A"}\n## Titolo\n::metric{key="k"}\n:::',
    )
    expect(problems).toEqual([
      { kind: 'nested-block', name: 'heading', line: 2 },
      { kind: 'nested-block', name: 'metric', line: 3 },
    ])
  })
})

describe('directive problems', () => {
  test('a directive line that does not parse is a problem, never text', () => {
    const lines = [
      '::metric {key="sdk"}',
      '::metric[a]b]{key="sdk"}',
      '::metric{key="sdk"} e poi testo',
      ':::',
      '::',
    ]
    const { blocks, problems } = parseNoteMarkdown(lines.join('\n\n'))

    expect(blocks).toEqual([])
    expect(problems).toEqual(
      [1, 3, 5, 7, 9].map((line) => ({
        kind: 'malformed-directive',
        name: '',
        line,
      })),
    )
  })

  test('a fence inside a case does not close it on a ::: line', () => {
    const { blocks, problems } = parseNoteMarkdown(
      ':::case{title="A"}\n```\n:::\n```\nDopo il codice.\n:::\nFuori.',
    )

    expect(problems).toEqual([])
    expect(blocks).toEqual([
      {
        kind: 'case',
        id: 'a',
        title: plain('A'),
        blocks: [
          { kind: 'code', language: null, text: ':::' },
          { kind: 'paragraph', inlines: plain('Dopo il codice.') },
        ],
      },
      { kind: 'paragraph', inlines: plain('Fuori.') },
    ])
  })

  test('an unterminated fence is a problem, also inside a case', () => {
    expect(parseNoteMarkdown('Testo\n\n```ts\ncodice').problems).toEqual([
      { kind: 'unclosed-fence', name: 'ts', line: 3 },
    ])
    expect(
      parseNoteMarkdown(':::case{title="A"}\n```\ncodice\n:::').problems,
    ).toEqual([
      { kind: 'unclosed-directive', name: 'case', line: 1 },
      { kind: 'unclosed-fence', name: '', line: 2 },
    ])
  })

  test('the misused form of a known directive is unknown', () => {
    expect(parseNoteMarkdown('::case{title="A"}').problems).toEqual([
      { kind: 'unknown-directive', name: 'case', line: 1 },
    ])
  })
})
