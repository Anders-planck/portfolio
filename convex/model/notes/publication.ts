import { type Infer, v } from 'convex/values'

import type { Doc } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'
import { findPublishedPointer } from '../content/pointers'
import { readVersions } from '../content/versions'
import { readNoteFirstPublishedAt } from './firstpublication'

/**
 * Where a note stands, read from the content store (never stored on the
 * note): live (maybe with an edit scheduled), scheduled, or a draft.
 */
export const notePublicationValidator = v.union(
  v.object({ kind: v.literal('draft') }),
  v.object({ kind: v.literal('scheduled'), scheduledAt: v.number() }),
  v.object({
    kind: v.literal('published'),
    /** When it first went live: the public date. */
    publishedAt: v.number(),
    /** When a scheduled edit of the live note goes live, if one waits. */
    scheduledEditAt: v.union(v.number(), v.null()),
  }),
)
export type NotePublication = Infer<typeof notePublicationValidator>

/** Scheduled releases waiting at once; a handful in practice. */
const MAX_SCHEDULED_RELEASES = 100

type ScheduledRelease = Extract<Doc<'releases'>, { status: 'scheduled' }>

/** The releases waiting to go live. */
export async function readScheduledReleases(
  ctx: QueryCtx,
): Promise<ScheduledRelease[]> {
  const releases = await ctx.db
    .query('releases')
    .withIndex('by_status', (query) => query.eq('status', 'scheduled'))
    .take(MAX_SCHEDULED_RELEASES)
  return releases.filter(
    (release): release is ScheduledRelease => release.status === 'scheduled',
  )
}

/** When each note with a pending scheduled release goes live, by note key. */
export async function readScheduledNotes(
  ctx: QueryCtx,
): Promise<ReadonlyMap<string, number>> {
  const entries = await Promise.all(
    (await readScheduledReleases(ctx)).map(async (release) => {
      const versions = await readVersions(ctx, release.versionIds)
      return versions
        .filter((version) => version.collection === 'note')
        .map((version) => [version.key, release.scheduledAt] as const)
    }),
  )
  return new Map(entries.flat())
}

/** The publishedAt of the release behind a note's live version, or null. */
export async function readLivePublishedAt(
  ctx: QueryCtx,
  key: string,
): Promise<number | null> {
  const pointer = await findPublishedPointer(ctx, { collection: 'note', key })
  if (pointer === null) {
    return null
  }
  const release = await ctx.db.get(pointer.releaseId)
  if (release?.status !== 'published') {
    // Only a published release (or a rollback, also published) moves pointers.
    throw new Error(
      `Note pointer names no published release ${pointer.releaseId}`,
    )
  }
  return release.publishedAt
}

export async function readNotePublication(
  ctx: QueryCtx,
  key: string,
  scheduledNotes: ReadonlyMap<string, number>,
): Promise<NotePublication> {
  const scheduledAt = scheduledNotes.get(key) ?? null
  const livePublishedAt = await readLivePublishedAt(ctx, key)
  if (livePublishedAt !== null) {
    return {
      kind: 'published',
      publishedAt: await readNoteFirstPublishedAt(ctx, key, livePublishedAt),
      scheduledEditAt: scheduledAt,
    }
  }
  return scheduledAt === null
    ? { kind: 'draft' }
    : { kind: 'scheduled', scheduledAt }
}
