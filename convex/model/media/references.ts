import type { Id } from '../../_generated/dataModel'
import type { Snapshot } from '../content/snapshot'

/**
 * Where a document points at media (pure): the one place that knows each
 * collection's media fields, so usage and the alt rule cannot disagree.
 * The Profile is the only collection so far; the next one with media
 * fields switches on `snapshot.collection` here.
 */

export interface MediaReference {
  mediaId: Id<'media'>
  /** Field path inside the document, as rule findings name it. */
  field: string
}

export function findMediaReferences(snapshot: Snapshot): MediaReference[] {
  // Absent in Profile drafts and versions written before the CV field.
  const cvMediaId = snapshot.fields.cvMediaId ?? null
  return cvMediaId === null ? [] : [{ mediaId: cvMediaId, field: 'cvMediaId' }]
}
