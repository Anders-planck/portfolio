import type { Doc } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'
import { readVersions } from '../content/versions'
import { readScheduledReleases } from './publication'
import { MAX_NOTES } from './tables'

/** A slug a note holds somewhere: in its draft, live, or in a pending release. */
export interface NoteSlugClaim {
  key: string
  slug: string
}

/**
 * Every slug a note holds: its draft's, its live version's and the ones in
 * pending scheduled releases. A renamed draft keeps its live and scheduled
 * slugs taken until they stop being live or pending, so two notes never
 * share an address.
 */
export async function readNoteSlugClaims(
  ctx: QueryCtx,
  drafts: readonly Doc<'notes'>[],
): Promise<NoteSlugClaim[]> {
  const pointers = await ctx.db
    .query('publishedPointers')
    .withIndex('by_collection_and_key', (query) =>
      query.eq('collection', 'note'),
    )
    .take(MAX_NOTES)
  const live = await readVersions(
    ctx,
    pointers.map((pointer) => pointer.versionId),
  )
  const scheduled = await Promise.all(
    (await readScheduledReleases(ctx)).map((release) =>
      readVersions(ctx, release.versionIds),
    ),
  )
  return [
    ...drafts.map(({ key, slug }) => ({ key, slug })),
    ...[...live, ...scheduled.flat()].flatMap(({ snapshot }) =>
      snapshot.collection === 'note'
        ? [{ key: snapshot.key, slug: snapshot.fields.slug }]
        : [],
    ),
  ]
}
