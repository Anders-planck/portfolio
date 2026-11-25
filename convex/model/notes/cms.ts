import { type Infer, v } from 'convex/values'

import type { QueryCtx } from '../../_generated/server'
import { readDraftSnapshot } from '../content/drafts'
import { type Locale, localeValidator } from '../content/locales'
import { readRuleContext } from '../content/rulecontext'
import {
  documentFindingValidator,
  PUBLISH_RULES,
  runPublishRules,
} from '../content/rules'
import { readNoteDraft } from './drafts'
import {
  EMPTY_NOTE_CONTENT_FIELDS,
  noteContentFieldsValidator,
  noteFieldsValidator,
  noteTopicValidator,
} from './fields'
import { parseNoteMarkdown } from './markdown'
import {
  notePublicationValidator,
  readNotePublication,
  readScheduledNotes,
} from './publication'
import { renderNoteBody } from './render'
import { outlineEntryValidator, renderedBlockValidator } from './rendered'
import { MAX_NOTES } from './tables'
import { readMetricRendering } from './views'

/** What the CMS reads of note drafts: the Note list and the note editor. */

/** One row of the CMS Note list. */
export const noteRowValidator = v.object({
  key: v.string(),
  /** The Italian title, else the first translation's; '' when untitled. */
  title: v.string(),
  topic: noteTopicValidator,
  locales: v.array(localeValidator),
  publication: notePublicationValidator,
  readingMinutes: v.union(v.number(), v.null()),
  updatedAt: v.number(),
})
export type NoteRow = Infer<typeof noteRowValidator>

/** Every note draft, most recently edited first. */
export async function listNoteRows(ctx: QueryCtx): Promise<NoteRow[]> {
  const notes = await ctx.db.query('notes').take(MAX_NOTES)
  const scheduledNotes = await readScheduledNotes(ctx)
  const rows = await Promise.all(
    notes.map(async (note): Promise<NoteRow> => {
      const draft = await readNoteDraft(ctx, note.key)
      const content = draft?.content ?? []
      const source =
        content.find((record) => record.locale === 'it') ?? content[0]
      return {
        key: note.key,
        title: source?.title ?? '',
        topic: note.topic,
        locales: content.map((record) => record.locale),
        publication: await readNotePublication(ctx, note.key, scheduledNotes),
        readingMinutes:
          source === undefined || source.body.trim() === ''
            ? null
            : renderNoteBody(parseNoteMarkdown(source.body).blocks, {
                metrics: new Map(),
                locale: source.locale,
                style: 'exact',
              }).readingMinutes,
        updatedAt: note.updatedAt,
      }
    }),
  )
  return rows.sort((first, second) => second.updatedAt - first.updatedAt)
}

/** What the note editor opens in one locale, with a live preview and checks. */
export const editableNoteValidator = v.object({
  revision: v.number(),
  savedAt: v.number(),
  fields: noteFieldsValidator,
  content: noteContentFieldsValidator,
  translatedLocales: v.array(localeValidator),
  publication: notePublicationValidator,
  preview: v.object({
    blocks: v.array(renderedBlockValidator),
    outline: v.array(outlineEntryValidator),
    wordCount: v.number(),
    readingMinutes: v.number(),
  }),
  /** The publish rules on the draft now: the same code publish runs. */
  findings: v.array(documentFindingValidator),
})
export type EditableNote = Infer<typeof editableNoteValidator>

export async function readEditableNote(
  ctx: QueryCtx,
  key: string,
  locale: Locale,
): Promise<EditableNote | null> {
  const draft = await readNoteDraft(ctx, key)
  const snapshot = await readDraftSnapshot(ctx, { collection: 'note', key })
  if (draft === null || snapshot === null) {
    return null
  }
  const record = draft.content.find((entry) => entry.locale === locale)
  const content = record ?? EMPTY_NOTE_CONTENT_FIELDS
  const rendering = await readMetricRendering(
    ctx,
    record === undefined ? [] : [record],
  )
  const ruleContext = await readRuleContext(ctx)
  const { slug, topic, linkedProjectKeys } = draft.fields
  return {
    revision: draft.fields.revision,
    savedAt: draft.fields.updatedAt,
    fields: { slug, topic, linkedProjectKeys },
    content: {
      title: content.title,
      summary: content.summary,
      body: content.body,
    },
    translatedLocales: draft.content.map((entry) => entry.locale),
    publication: await readNotePublication(
      ctx,
      key,
      await readScheduledNotes(ctx),
    ),
    preview: renderNoteBody(parseNoteMarkdown(content.body).blocks, {
      ...rendering,
      locale,
    }),
    findings: runPublishRules([snapshot], PUBLISH_RULES, ruleContext),
  }
}
