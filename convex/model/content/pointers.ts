import type { Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import type { Locale } from './locales'
import {
  type DocumentRef,
  type LocalizedDocument,
  toLocalizedDocumentFromSnapshot,
} from './snapshot'
import { readVersions } from './versions'

/**
 * Published pointers: the live version of each document. The public site
 * reads only through them, so moving them is what makes a release live.
 */

/** What the public site shows for a document in a locale, or null. */
export async function readPublishedDocument(
  ctx: QueryCtx,
  ref: DocumentRef,
  locale: Locale,
): Promise<LocalizedDocument | null> {
  const pointer = await findPublishedPointer(ctx, ref)
  if (pointer === null) {
    return null
  }
  const version = await ctx.db.get(pointer.versionId)
  return version === null
    ? null
    : toLocalizedDocumentFromSnapshot(version.snapshot, locale)
}

/** Points every document of the release at the release's version of it. */
export async function movePublishedPointers(
  ctx: MutationCtx,
  releaseId: Id<'releases'>,
  versionIds: Id<'versions'>[],
) {
  const versions = await readVersions(ctx, versionIds)
  for (const { _id: versionId, collection, key } of versions) {
    const pointer = await findPublishedPointer(ctx, { collection, key })
    if (pointer === null) {
      await ctx.db.insert('publishedPointers', {
        collection,
        key,
        versionId,
        releaseId,
      })
    } else {
      await ctx.db.patch(pointer._id, { versionId, releaseId })
    }
  }
}

function findPublishedPointer(ctx: QueryCtx, { collection, key }: DocumentRef) {
  return ctx.db
    .query('publishedPointers')
    .withIndex('by_collection_and_key', (query) =>
      query.eq('collection', collection).eq('key', key),
    )
    .unique()
}
