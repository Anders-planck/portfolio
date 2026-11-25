import type { Doc } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'

/**
 * A note's public date: when it first went live. Publish records it once
 * per note key (`content/releases.ts` calls this as pointers move), so
 * publishing an edit, a scheduled release or a rollback never moves it,
 * nor the note's place in the list.
 */

/** Records the first publication of every note among `versions`. */
export async function recordNoteFirstPublications(
  ctx: MutationCtx,
  versions: Doc<'versions'>[],
  publishedAt: number,
) {
  const noteKeys = versions
    .filter((version) => version.collection === 'note')
    .map((version) => version.key)
  for (const key of noteKeys) {
    if ((await findFirstPublication(ctx, key)) === null) {
      await ctx.db.insert('noteFirstPublications', { key, publishedAt })
    }
  }
}

/**
 * When the note first went live. `livePublishedAt` (its live release) stands
 * in for a note without a record: one published on a backend that ran this
 * branch before the record existed (local e2e backends keep their data
 * between runs, and the seed note does not publish twice).
 */
export async function readNoteFirstPublishedAt(
  ctx: QueryCtx,
  key: string,
  livePublishedAt: number,
): Promise<number> {
  const first = await findFirstPublication(ctx, key)
  return first?.publishedAt ?? livePublishedAt
}

function findFirstPublication(ctx: QueryCtx, key: string) {
  return ctx.db
    .query('noteFirstPublications')
    .withIndex('by_key', (query) => query.eq('key', key))
    .unique()
}
