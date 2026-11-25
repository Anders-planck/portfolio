import { type Infer, v } from 'convex/values'

import type { QueryCtx } from '../../_generated/server'
import { readAllDraftSnapshots } from '../content/drafts'
import { localeValidator } from '../content/locales'
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
  /** The locale whose content uses it; null for a shared field (the CV). */
  locale: v.union(localeValidator, v.null()),
  /** `live`: the published site shows it; `draft`: the next publish would. */
  state: v.union(v.literal('draft'), v.literal('live')),
})
export type MediaUsage = Infer<typeof mediaUsageValidator>

export async function readMediaUsages(
  ctx: QueryCtx,
): Promise<ReadonlyMap<string, MediaUsage[]>> {
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
  }, new Map<string, MediaUsage[]>())
}

function toUsagesFromSnapshot(snapshot: Snapshot, state: MediaUsage['state']) {
  return findMediaReferences(snapshot).map(({ mediaId, field, locale }) => ({
    mediaId,
    usage: {
      collection: snapshot.collection,
      key: snapshot.key,
      field,
      locale,
      state,
    },
  }))
}
