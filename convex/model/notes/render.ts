import type { Locale } from '../content/locales'
import type { FigureMedia } from '../media/figures'
import type { LargeNumberStyle } from '../metrics/format'
import {
  type RenderableMetric,
  renderMetricReferences,
} from '../metrics/render'
import type { CodeRun, ParsedInline, TextRun } from './inline'
import type { ParsedBlock, ParsedSimpleBlock } from './markdown'
import type {
  InlineRun,
  LabelRun,
  OutlineEntry,
  RenderedBlock,
  RenderedSimpleBlock,
} from './rendered'

/**
 * Renders a parsed note body for one locale (pure): metric references become
 * verified figures through the metrics module (ADR 0004), `::figure` shows
 * its image with the alt of the locale (left out when the image or that alt
 * is missing), and the Outline and reading time are read from the result.
 */

/** Words a minute, so a mockup note of about twelve hundred words reads in seven. */
const WORDS_PER_MINUTE = 180

export interface NoteRendering {
  metrics: ReadonlyMap<string, RenderableMetric>
  locale: Locale
  style: LargeNumberStyle
  /** The images figures name, by the id as written (`media/figures.ts`). */
  figures: ReadonlyMap<string, FigureMedia>
}

export interface RenderedNoteBody {
  blocks: RenderedBlock[]
  outline: OutlineEntry[]
  wordCount: number
  readingMinutes: number
}

export function renderNoteBody(
  parsed: ParsedBlock[],
  rendering: NoteRendering,
): RenderedNoteBody {
  const blocks = parsed.flatMap((block) => renderBlock(block, rendering))
  const wordCount = countWords(blocks.map(toReadTextFromBlock).join(' '))
  return {
    blocks,
    outline: blocks.flatMap(toOutlineEntries),
    wordCount,
    readingMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
  }
}

function renderBlock(
  block: ParsedBlock,
  rendering: NoteRendering,
): RenderedBlock[] {
  const runs = (inlines: ParsedInline[]) => renderInlineRuns(inlines, rendering)
  switch (block.kind) {
    case 'heading':
      return [{ ...block, inlines: runs(block.inlines) }]
    case 'case':
      return [
        {
          ...block,
          title: runs(block.title),
          blocks: block.blocks.map((inner) =>
            renderSimpleBlock(inner, rendering),
          ),
        },
      ]
    case 'metric':
      return [
        {
          kind: 'metric',
          key: block.key,
          label: runs(block.label),
          reading: readMetricText(block.key, rendering),
        },
      ]
    case 'figure':
      return renderFigure(block, rendering)
    default:
      return [renderSimpleBlock(block, rendering)]
  }
}

function renderFigure(
  block: Extract<ParsedBlock, { kind: 'figure' }>,
  rendering: NoteRendering,
): RenderedBlock[] {
  const figure = rendering.figures.get(block.mediaId)
  const alt = figure?.alts.get(rendering.locale) ?? ''
  if (figure === undefined || alt.trim() === '') {
    return []
  }
  const { sources, widthPx, heightPx } = figure
  return [
    {
      kind: 'figure',
      image: { ...sources, widthPx, heightPx, alt },
      caption: renderInlineRuns(block.caption, rendering),
    },
  ]
}

function renderSimpleBlock(
  block: ParsedSimpleBlock,
  rendering: NoteRendering,
): RenderedSimpleBlock {
  const runs = (inlines: ParsedInline[]) => renderInlineRuns(inlines, rendering)
  switch (block.kind) {
    case 'paragraph':
      return { kind: 'paragraph', inlines: runs(block.inlines) }
    case 'list':
      return { ...block, items: block.items.map(runs) }
    case 'quote':
      return { kind: 'quote', paragraphs: block.paragraphs.map(runs) }
    case 'code':
      return block
  }
}

/** Inline runs with their metric references rendered. */
export function renderInlineRuns(
  inlines: ParsedInline[],
  rendering: NoteRendering,
): InlineRun[] {
  return inlines.flatMap((run): InlineRun[] =>
    run.kind === 'link'
      ? [
          {
            kind: 'link',
            href: run.href,
            children: run.children.flatMap((child) =>
              renderLabelRun(child, rendering),
            ),
          },
        ]
      : renderLabelRun(run, rendering),
  )
}

function renderLabelRun(
  run: TextRun | CodeRun,
  { metrics, locale, style }: NoteRendering,
): LabelRun[] {
  if (run.kind === 'code') {
    return [run]
  }
  const { marks } = run
  return renderMetricReferences(run.text, metrics, locale, style).map(
    (segment): LabelRun => ({ ...segment, marks }),
  )
}

function readMetricText(key: string, rendering: NoteRendering) {
  const [segment] = renderMetricReferences(
    `{{m:${key}}}`,
    rendering.metrics,
    rendering.locale,
    rendering.style,
  )
  return segment?.kind === 'metric'
    ? { text: segment.text, verifiedAt: segment.verifiedAt }
    : null
}

/** What a reader reads of runs: text, figures, labels and inline code. */
export function toPlainTextFromRuns(runs: InlineRun[]): string {
  return runs
    .map((run) => {
      switch (run.kind) {
        case 'link':
          return toPlainTextFromRuns(run.children)
        case 'unavailable':
          return ''
        default:
          return run.text
      }
    })
    .join('')
}

function toReadTextFromBlock(block: RenderedBlock): string {
  switch (block.kind) {
    case 'heading':
    case 'paragraph':
      return toPlainTextFromRuns(block.inlines)
    case 'list':
      return block.items.map(toPlainTextFromRuns).join(' ')
    case 'quote':
      return block.paragraphs.map(toPlainTextFromRuns).join(' ')
    case 'case':
      return [
        toPlainTextFromRuns(block.title),
        ...block.blocks.map(toReadTextFromBlock),
      ].join(' ')
    case 'metric':
      return toPlainTextFromRuns(block.label)
    case 'figure':
      return toPlainTextFromRuns(block.caption)
    case 'code':
      return ''
  }
}

function countWords(text: string) {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length
}

function toOutlineEntries(block: RenderedBlock): OutlineEntry[] {
  if (block.kind === 'heading') {
    return [
      {
        id: block.id,
        label: toPlainTextFromRuns(block.inlines),
        level: block.level,
      },
    ]
  }
  if (block.kind === 'case') {
    return [{ id: block.id, label: toPlainTextFromRuns(block.title), level: 2 }]
  }
  return []
}
