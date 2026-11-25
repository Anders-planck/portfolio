import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { localeValidator } from './model/content/locales'
import {
  editableNoteValidator,
  listNoteRows,
  noteRowValidator,
  readEditableNote,
} from './model/notes/cms'
import {
  checkNoteKey,
  createNoteDraft,
  findNote,
  hasRoomForNote,
  noteDraftEditValidator,
  saveNoteDraftEdit,
} from './model/notes/drafts'
import {
  listPublishedNoteCards,
  readPublishedNotePage,
} from './model/notes/published'
import { noteCardValidator, notePageValidator } from './model/notes/views'
import { requireOwner } from './model/owner'

/**
 * Notes (ticket 11): the `note` collection of the content store. Publish,
 * scheduling and rollback go through `content.publish` / `content.rollback`;
 * these functions read published notes for the site and drafts for the CMS.
 * The CMS ones start with `requireOwner` (ADR 0005).
 */

/** The Note list: every published note, newest first. */
export const listPublished = query({
  args: {},
  returns: v.array(noteCardValidator),
  handler: (ctx) => listPublishedNoteCards(ctx),
})

/** The Nota page: a published note by slug, or null. */
export const getPublished = query({
  args: { slug: v.string() },
  returns: v.union(notePageValidator, v.null()),
  handler: (ctx, { slug }) => readPublishedNotePage(ctx, slug),
})

/** The CMS Note list: every note draft with where it stands. */
export const listNotes = query({
  args: {},
  returns: v.array(noteRowValidator),
  handler: async (ctx) => {
    await requireOwner(ctx)
    return listNoteRows(ctx)
  },
})

/**
 * Creates an empty note; repeating the same key returns the same note. Past
 * the note limit nothing is created and the CMS says so.
 */
export const createNote = mutation({
  args: { key: v.string() },
  returns: v.union(
    v.object({ kind: v.literal('created'), key: v.string() }),
    v.object({ kind: v.literal('limit-reached') }),
  ),
  handler: async (ctx, { key }) => {
    await requireOwner(ctx)
    checkNoteKey(key)
    if ((await findNote(ctx, key)) === null && !(await hasRoomForNote(ctx))) {
      return { kind: 'limit-reached' as const }
    }
    await createNoteDraft(ctx, key, Date.now())
    return { kind: 'created' as const, key }
  },
})

/** What the note editor opens in one locale, or null for an unknown note. */
export const getEditableNote = query({
  args: { key: v.string(), locale: localeValidator },
  returns: v.union(editableNoteValidator, v.null()),
  handler: async (ctx, { key, locale }) => {
    await requireOwner(ctx)
    return readEditableNote(ctx, key, locale)
  },
})

/** Live-saves a note edit; the revision is what `content.publish` checks. */
export const saveDraft = mutation({
  args: noteDraftEditValidator,
  returns: v.object({ savedAt: v.number(), revision: v.number() }),
  handler: async (ctx, edit) => {
    await requireOwner(ctx)
    const savedAt = Date.now()
    const { revision } = await saveNoteDraftEdit(ctx, edit, savedAt)
    return { savedAt, revision }
  },
})
