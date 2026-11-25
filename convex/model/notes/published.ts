import type { QueryCtx } from '../../_generated/server'
import type { Snapshot } from '../content/snapshot'
import { readNoteFirstPublishedAt } from './firstpublication'
import { MAX_NOTES } from './tables'
import {
  type NoteCard,
  type NotePage,
  readMetricRendering,
  toNotePageTranslation,
} from './views'

/**
 * Published notes, read only through the content store's pointers (a draft
 * is never public, ADR 0003). Newest first: a note's date is when it
 * first went live (`firstpublication.ts`), so publishing again never moves it.
 */

type NoteSnapshot = Extract<Snapshot, { collection: 'note' }>

interface LiveNote {
  snapshot: NoteSnapshot
  publishedAt: number
}

async function readLiveNotes(ctx: QueryCtx): Promise<LiveNote[]> {
  const pointers = await ctx.db
    .query('publishedPointers')
    .withIndex('by_collection_and_key', (query) =>
      query.eq('collection', 'note'),
    )
    .take(MAX_NOTES)
  const notes = await Promise.all(
    pointers.map(async (pointer): Promise<LiveNote[]> => {
      const version = await ctx.db.get(pointer.versionId)
      const release = await ctx.db.get(pointer.releaseId)
      if (version?.snapshot.collection !== 'note') {
        // Versions are never deleted, and a note pointer names a note version.
        throw new Error(
          `Note pointer names no note version ${pointer.versionId}`,
        )
      }
      if (release?.status !== 'published') {
        throw new Error(
          `Note pointer names no published release ${pointer.releaseId}`,
        )
      }
      const publishedAt = await readNoteFirstPublishedAt(
        ctx,
        pointer.key,
        release.publishedAt,
      )
      return [{ snapshot: version.snapshot, publishedAt }]
    }),
  )
  return notes
    .flat()
    .sort((first, second) => second.publishedAt - first.publishedAt)
}

/** The Note list: every published note, newest first, all its translations. */
export async function listPublishedNoteCards(
  ctx: QueryCtx,
): Promise<NoteCard[]> {
  const notes = await readLiveNotes(ctx)
  const rendering = await readMetricRendering(
    ctx,
    notes.flatMap((note) => note.snapshot.content),
  )
  return notes.map(({ snapshot, publishedAt }) => ({
    slug: snapshot.fields.slug,
    topic: snapshot.fields.topic,
    publishedAt,
    translations: snapshot.content.map((record) => {
      const { locale, title, summary, readingMinutes } = toNotePageTranslation(
        record,
        rendering,
      )
      return { locale, title, summary, readingMinutes }
    }),
  }))
}

/** One published note by its slug, with the next older one, or null. */
export async function readPublishedNotePage(
  ctx: QueryCtx,
  slug: string,
): Promise<NotePage | null> {
  const notes = await readLiveNotes(ctx)
  const position = notes.findIndex((note) => note.snapshot.fields.slug === slug)
  const note = notes[position]
  if (note === undefined) {
    return null
  }
  const next = notes[position + 1] ?? null
  const rendering = await readMetricRendering(ctx, [
    ...note.snapshot.content,
    ...(next?.snapshot.content ?? []),
  ])
  return {
    slug,
    topic: note.snapshot.fields.topic,
    publishedAt: note.publishedAt,
    translations: note.snapshot.content.map((record) =>
      toNotePageTranslation(record, rendering),
    ),
    next:
      next === null
        ? null
        : {
            slug: next.snapshot.fields.slug,
            translations: next.snapshot.content.map((record) => ({
              locale: record.locale,
              title: toNotePageTranslation(record, rendering).title,
            })),
          },
  }
}
