import { ConvexError, type Infer, v } from 'convex/values'

import type { Doc, Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { type Locale, LOCALES, localeValidator } from '../content/locales'
import {
  EMPTY_NOTE_CONTENT_FIELDS,
  EMPTY_NOTE_FIELDS,
  type NoteContentFields,
  noteContentFieldsValidator,
  noteFieldsValidator,
  pickNoteContentFields,
} from './fields'
import { MAX_NOTES } from './tables'

/**
 * Note drafts (tables `notes` + `noteContent`): what the editor saves and
 * what publish freezes. Same contract as every draft of the content store:
 * each save moves `revision`, which publish checks against (ADR 0003).
 */

/** A note has at most one content record per site locale. */
const MAX_LOCALE_RECORDS = LOCALES.length

/** A live-save edit: some shared fields and/or some fields of one locale. */
export const noteDraftEditValidator = v.object({
  key: v.string(),
  fields: v.optional(noteFieldsValidator.partial()),
  localeEdit: v.optional(
    v.object({
      locale: localeValidator,
      content: noteContentFieldsValidator.partial(),
    }),
  ),
})
export type NoteDraftEdit = Infer<typeof noteDraftEditValidator>

/** What a draft read gives the store: the whole note, every locale. */
export interface NoteDraft {
  fields: Doc<'notes'>
  content: (NoteContentFields & { locale: Locale })[]
}

/** A note key the editor chooses: a random id, so a repeated create is one note. */
const NOTE_KEY_PATTERN = /^[a-z0-9-]{8,64}$/

/** Refuses a key the editor never makes (a forged or broken call). */
function checkNoteKey(key: string) {
  if (!NOTE_KEY_PATTERN.test(key)) {
    throw new ConvexError({ kind: 'invalid-note-key' })
  }
}

/**
 * Every note draft, one past `MAX_NOTES` so a count can tell the cap was
 * passed (reads elsewhere list at most `MAX_NOTES`).
 */
export function readNoteDrafts(ctx: QueryCtx) {
  return ctx.db.query('notes').take(MAX_NOTES + 1)
}

/** A create: the note (new or already there), or no room under the cap. */
export type NoteCreation =
  { kind: 'created'; note: Doc<'notes'> } | { kind: 'limit-reached' }

export function findNote(ctx: QueryCtx, key: string) {
  return ctx.db
    .query('notes')
    .withIndex('by_key', (query) => query.eq('key', key))
    .unique()
}

/**
 * Creates an empty note under `key` (chosen by the editor, so a repeated
 * create is the same note, DATA-06); an existing note is left as it is. A
 * new note past `MAX_NOTES` is not created.
 */
export async function createNoteDraft(
  ctx: MutationCtx,
  key: string,
  now: number,
): Promise<NoteCreation> {
  checkNoteKey(key)
  const existing = await findNote(ctx, key)
  if (existing !== null) {
    return { kind: 'created', note: existing }
  }
  if ((await readNoteDrafts(ctx)).length >= MAX_NOTES) {
    return { kind: 'limit-reached' }
  }
  const note = {
    key,
    ...EMPTY_NOTE_FIELDS,
    revision: 0,
    createdAt: now,
    updatedAt: now,
  }
  const noteId = await ctx.db.insert('notes', note)
  return { kind: 'created', note: { _id: noteId, _creationTime: now, ...note } }
}

/** Applies a live-save edit, creating the note if needed. */
export async function saveNoteDraftEdit(
  ctx: MutationCtx,
  edit: NoteDraftEdit,
  savedAt: number,
) {
  const creation = await createNoteDraft(ctx, edit.key, savedAt)
  if (creation.kind === 'limit-reached') {
    // The editor saves only notes `createNote` made, so this is a broken call.
    throw new ConvexError({ kind: 'note-limit' })
  }
  const { note } = creation
  const revision = note.revision + 1
  await ctx.db.patch(note._id, { ...edit.fields, revision, updatedAt: savedAt })
  if (edit.localeEdit !== undefined) {
    await saveNoteContent(ctx, {
      noteId: note._id,
      ...edit.localeEdit,
      savedAt,
    })
  }
  return { revision }
}

/** The whole draft of a note, or null when the note does not exist. */
export async function readNoteDraft(
  ctx: QueryCtx,
  key: string,
): Promise<NoteDraft | null> {
  const note = await findNote(ctx, key)
  if (note === null) {
    return null
  }
  const records = await ctx.db
    .query('noteContent')
    .withIndex('by_note_and_locale', (query) => query.eq('noteId', note._id))
    .take(MAX_LOCALE_RECORDS)
  return {
    fields: note,
    content: records.map((record) => ({
      locale: record.locale,
      ...pickNoteContentFields(record),
    })),
  }
}

async function saveNoteContent(
  ctx: MutationCtx,
  edit: {
    noteId: Id<'notes'>
    locale: Locale
    content: Partial<NoteContentFields>
    savedAt: number
  },
) {
  const { noteId, locale, content, savedAt } = edit
  const record = await ctx.db
    .query('noteContent')
    .withIndex('by_note_and_locale', (query) =>
      query.eq('noteId', noteId).eq('locale', locale),
    )
    .unique()
  if (record !== null) {
    await ctx.db.patch(record._id, { ...content, updatedAt: savedAt })
    return
  }
  await ctx.db.insert('noteContent', {
    noteId,
    locale,
    ...EMPTY_NOTE_CONTENT_FIELDS,
    ...content,
    updatedAt: savedAt,
  })
}
