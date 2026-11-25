import type { QueryCtx } from '../../_generated/server'
import type { Locale } from '../content/locales'
import type { Snapshot } from '../content/snapshot'
import { listLocalesWithAlt, readAltRecords } from './alts'
import { type MediaKind, toMediaKindFromMime } from './files'
import { findMediaReferences } from './references'

/** What the media rule needs to know about one referenced media. */
export interface RuleMedia {
  kind: MediaKind
  fileName: string
  /** Locales whose alt text is not blank. */
  altLocales: ReadonlySet<Locale>
}

/**
 * The media `snapshots` point at, by the id as written. An id that is not a
 * media id, or names deleted media, is left out: the rule reports it missing.
 */
export async function readRuleMedia(
  ctx: QueryCtx,
  snapshots: Snapshot[],
): Promise<Map<string, RuleMedia>> {
  const writtenIds = [
    ...new Set(
      snapshots.flatMap((snapshot) =>
        findMediaReferences(snapshot).map((reference) => reference.mediaId),
      ),
    ),
  ]
  const entries = await Promise.all(
    writtenIds.map(async (writtenId) => {
      const mediaId = ctx.db.normalizeId('media', writtenId)
      const media = mediaId === null ? null : await ctx.db.get(mediaId)
      if (media === null) {
        return null
      }
      const alts = await readAltRecords(ctx, media._id)
      const ruleMedia: RuleMedia = {
        kind: toMediaKindFromMime(media.mime),
        fileName: media.fileName,
        altLocales: new Set(listLocalesWithAlt(alts)),
      }
      return [writtenId, ruleMedia] as const
    }),
  )
  return new Map(entries.filter((entry) => entry !== null))
}
