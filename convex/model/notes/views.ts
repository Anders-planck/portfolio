import { type Infer, v } from 'convex/values'

import type { QueryCtx } from '../../_generated/server'
import { type Locale, localeValidator } from '../content/locales'
import { readFigureMedia } from '../media/figures'
import { listFigureMediaIds } from '../media/references'
import { readLargeNumberStyle } from '../metrics/readings'
import { listReferencedMetricKeys } from '../metrics/references'
import { readRenderableMetrics } from '../metrics/renderable'
import { type NoteContentFields, noteTopicValidator } from './fields'
import { parseInline } from './inline'
import { parseNoteMarkdown } from './markdown'
import { listNoteMetricKeys } from './prose'
import { type NoteRendering, renderInlineRuns, renderNoteBody } from './render'
import {
  inlineRunValidator,
  outlineEntryValidator,
  renderedBlockValidator,
} from './rendered'

/**
 * What the site shows of published notes: every translation, rendered in
 * its own locale (metric figures follow the locale), so the page picks the
 * reader's translation or a fallback with the shell's `pickTranslation`.
 */

const runsValidator = v.array(inlineRunValidator)

/** A note translation as the Note list shows it. */
export const noteCardTranslationValidator = v.object({
  locale: localeValidator,
  title: runsValidator,
  summary: runsValidator,
  readingMinutes: v.number(),
})

export const noteCardValidator = v.object({
  slug: v.string(),
  topic: noteTopicValidator,
  /** When the release that made the live version live was published. */
  publishedAt: v.number(),
  translations: v.array(noteCardTranslationValidator),
})
export type NoteCard = Infer<typeof noteCardValidator>

/** A note translation as the Nota page shows it. */
export const notePageTranslationValidator = noteCardTranslationValidator.extend(
  {
    blocks: v.array(renderedBlockValidator),
    outline: v.array(outlineEntryValidator),
  },
)

export const notePageValidator = v.object({
  slug: v.string(),
  topic: noteTopicValidator,
  publishedAt: v.number(),
  translations: v.array(notePageTranslationValidator),
  /** The next older published note; an unpublished one is never next. */
  next: v.union(
    v.object({
      slug: v.string(),
      translations: v.array(
        v.object({ locale: localeValidator, title: runsValidator }),
      ),
    }),
    v.null(),
  ),
})
export type NotePage = Infer<typeof notePageValidator>

export type LocaleRecord = NoteContentFields & { locale: Locale }

export type NotePageTranslation = Infer<typeof notePageTranslationValidator>

/** Renders one translation; the metrics map must hold every key it names. */
export function toNotePageTranslation(
  record: LocaleRecord,
  rendering: Omit<NoteRendering, 'locale'>,
): NotePageTranslation {
  const localeRendering = { ...rendering, locale: record.locale }
  const body = renderNoteBody(
    parseNoteMarkdown(record.body).blocks,
    localeRendering,
  )
  return {
    locale: record.locale,
    title: renderInlineRuns(parseInline(record.title), localeRendering),
    summary: renderInlineRuns(parseInline(record.summary), localeRendering),
    readingMinutes: body.readingMinutes,
    blocks: body.blocks,
    outline: body.outline,
  }
}

/** Reads the metrics, the rounding setting and the figure images every record needs to render. */
export async function readNoteRendering(
  ctx: QueryCtx,
  records: readonly LocaleRecord[],
): Promise<Omit<NoteRendering, 'locale'>> {
  const keys = records.flatMap((record) => [
    ...listReferencedMetricKeys(record.title),
    ...listReferencedMetricKeys(record.summary),
    ...listNoteMetricKeys(parseNoteMarkdown(record.body).blocks),
  ])
  return {
    metrics: await readRenderableMetrics(ctx, keys),
    style: await readLargeNumberStyle(ctx),
    figures: await readFigureMedia(
      ctx,
      records.flatMap((record) => listFigureMediaIds(record.body)),
    ),
  }
}
