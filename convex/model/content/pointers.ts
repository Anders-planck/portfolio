import { v } from 'convex/values'

import type { Doc, Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import type { Locale } from './locales'
import {
  collectionValidator,
  type DocumentRef,
  type LocalizedDocument,
  toDocumentPath,
  toLocalizedDocumentFromSnapshot,
} from './snapshot'
import { readVersions } from './versions'

/**
 * Published pointers: the live version of each document. The public site
 * reads only through them, so moving them is what makes a release live.
 */

/** Live documents the store keeps track of in one read; well above the site's size. */
const MAX_LIVE_DOCUMENTS = 1000

/** Which release a document's pointer came from when a release was scheduled. */
export const expectedPointerValidator = v.object({
  collection: collectionValidator,
  key: v.string(),
  releaseId: v.union(v.id('releases'), v.null()),
})

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
  if (version === null) {
    // Versions are never deleted, so a pointer always names one.
    throw new Error(
      `Published pointer names a missing version ${pointer.versionId}`,
    )
  }
  return toLocalizedDocumentFromSnapshot(version.snapshot, locale)
}

export function findPublishedPointer(
  ctx: QueryCtx,
  { collection, key }: DocumentRef,
) {
  return ctx.db
    .query('publishedPointers')
    .withIndex('by_collection_and_key', (query) =>
      query.eq('collection', collection).eq('key', key),
    )
    .unique()
}

/** The live versions of the whole site once `versions` are made live too. */
export async function readLiveVersionIdsAfter(
  ctx: QueryCtx,
  versions: Doc<'versions'>[],
): Promise<Id<'versions'>[]> {
  const pointers = await readAllPointers(ctx)
  return [
    ...pointers
      .filter((pointer) => !hasVersionOf(versions, pointer))
      .map((pointer) => pointer.versionId),
    ...versions.map((version) => version._id),
  ]
}

/** Points every document of the release at the release's version of it. */
export async function movePublishedPointers(
  ctx: MutationCtx,
  releaseId: Id<'releases'>,
  versions: Doc<'versions'>[],
) {
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

/**
 * Makes exactly `liveVersionIds` the live site: their documents point at
 * them, and every other document is unpublished.
 */
export async function replaceLiveSite(
  ctx: MutationCtx,
  releaseId: Id<'releases'>,
  liveVersionIds: Id<'versions'>[],
) {
  const versions = await readVersions(ctx, liveVersionIds)
  const pointers = await readAllPointers(ctx)
  const unpublished = pointers.filter(
    (pointer) => !hasVersionOf(versions, pointer),
  )
  for (const pointer of unpublished) {
    await ctx.db.delete(pointer._id)
  }
  await movePublishedPointers(ctx, releaseId, versions)
}

function hasVersionOf(versions: Doc<'versions'>[], ref: DocumentRef) {
  return versions.some(
    (version) => toDocumentPath(version) === toDocumentPath(ref),
  )
}

async function readAllPointers(ctx: QueryCtx) {
  const pointers = await ctx.db
    .query('publishedPointers')
    .take(MAX_LIVE_DOCUMENTS + 1)
  if (pointers.length > MAX_LIVE_DOCUMENTS) {
    throw new Error(`More than ${String(MAX_LIVE_DOCUMENTS)} live documents`)
  }
  return pointers
}
