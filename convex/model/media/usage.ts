import { type Infer, v } from 'convex/values'

import type { Id } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'
import { readAllDraftSnapshots } from '../content/drafts'
import { readLiveSnapshots } from '../content/pointers'
import { collectionValidator, type Snapshot } from '../content/snapshot'
import { findMediaReferences } from './references'

/**
 * Which documents point at which media (story 41, "usage graph"). Read from
 * the documents themselves on every call, drafts and live versions, rather
 * than kept in a table: a portfolio has tens of documents, and a derived
 * copy could drift from what the site actually shows (LEN-05).
 */

export const mediaUsageValidator = v.object({
  collection: collectionValidator,
  key: v.string(),
  field: v.string(),
  /** `live`: the published site shows it; `draft`: the next publish would. */
  state: v.union(v.literal('draft'), v.literal('live')),
})
export type MediaUsage = Infer<typeof mediaUsageValidator>

export async function readMediaUsages(
  ctx: QueryCtx,
): Promise<ReadonlyMap<Id<'media'>, MediaUsage[]>> {
  const [drafts, live] = await Promise.all([
    readAllDraftSnapshots(ctx),
    readLiveSnapshots(ctx),
  ])
  const references = [
    ...drafts.flatMap((snapshot) => toUsagesFromSnapshot(snapshot, 'draft')),
    ...live.flatMap((snapshot) => toUsagesFromSnapshot(snapshot, 'live')),
  ]
  return references.reduce((usagesByMedia, { mediaId, usage }) => {
    usagesByMedia.set(mediaId, [...(usagesByMedia.get(mediaId) ?? []), usage])
    return usagesByMedia
  }, new Map<Id<'media'>, MediaUsage[]>())
}

function toUsagesFromSnapshot(snapshot: Snapshot, state: MediaUsage['state']) {
  return findMediaReferences(snapshot).map(({ mediaId, field }) => ({
    mediaId,
    usage: { collection: snapshot.collection, key: snapshot.key, field, state },
  }))
}
