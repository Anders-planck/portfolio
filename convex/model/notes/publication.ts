import { type Infer, v } from 'convex/values'

import type { QueryCtx } from '../../_generated/server'
import { findPublishedPointer } from '../content/pointers'
import { readVersions } from '../content/versions'

/**
 * Where a note stands, read from the content store (never stored on the
 * note): a pending scheduled release wins, then a live version, else draft.
 */
export const notePublicationValidator = v.union(
  v.object({ kind: v.literal('draft') }),
  v.object({ kind: v.literal('scheduled'), scheduledAt: v.number() }),
  v.object({ kind: v.literal('published'), publishedAt: v.number() }),
)
export type NotePublication = Infer<typeof notePublicationValidator>

/** Scheduled releases waiting at once; a handful in practice. */
const MAX_SCHEDULED_RELEASES = 100

/** When each note with a pending scheduled release goes live, by note key. */
export async function readScheduledNotes(
  ctx: QueryCtx,
): Promise<ReadonlyMap<string, number>> {
  const releases = await ctx.db
    .query('releases')
    .withIndex('by_status', (query) => query.eq('status', 'scheduled'))
    .take(MAX_SCHEDULED_RELEASES)
  const entries = await Promise.all(
    releases.map(async (release) => {
      if (release.status !== 'scheduled') {
        return []
      }
      const versions = await readVersions(ctx, release.versionIds)
      return versions
        .filter((version) => version.collection === 'note')
        .map((version) => [version.key, release.scheduledAt] as const)
    }),
  )
  return new Map(entries.flat())
}

export async function readNotePublication(
  ctx: QueryCtx,
  key: string,
  scheduledNotes: ReadonlyMap<string, number>,
): Promise<NotePublication> {
  const scheduledAt = scheduledNotes.get(key)
  if (scheduledAt !== undefined) {
    return { kind: 'scheduled', scheduledAt }
  }
  const pointer = await findPublishedPointer(ctx, { collection: 'note', key })
  if (pointer === null) {
    return { kind: 'draft' }
  }
  const release = await ctx.db.get(pointer.releaseId)
  if (release?.status !== 'published') {
    // Only a published release (or a rollback, also published) moves pointers.
    throw new Error(
      `Note pointer names no published release ${pointer.releaseId}`,
    )
  }
  return { kind: 'published', publishedAt: release.publishedAt }
}
