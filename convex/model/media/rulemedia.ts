import type { Id } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'
import type { Locale } from '../content/locales'
import type { Snapshot } from '../content/snapshot'
import { listLocalesWithAlt, readAltRecords } from './alts'
import { type MediaKind, toMediaKindFromMime } from './files'
import { findMediaReferences } from './references'

/** What the alt rule needs to know about one referenced media. */
export interface RuleMedia {
  kind: MediaKind
  fileName: string
  /** Locales whose alt text is not blank. */
  altLocales: ReadonlySet<Locale>
}

/** The media `snapshots` point at; ids of deleted media are left out. */
export async function readRuleMedia(
  ctx: QueryCtx,
  snapshots: Snapshot[],
): Promise<Map<Id<'media'>, RuleMedia>> {
  const mediaIds = [
    ...new Set(
      snapshots.flatMap((snapshot) =>
        findMediaReferences(snapshot).map((reference) => reference.mediaId),
      ),
    ),
  ]
  const entries = await Promise.all(
    mediaIds.map(async (mediaId) => {
      const media = await ctx.db.get(mediaId)
      if (media === null) {
        return null
      }
      const alts = await readAltRecords(ctx, mediaId)
      const ruleMedia: RuleMedia = {
        kind: toMediaKindFromMime(media.mime),
        fileName: media.fileName,
        altLocales: new Set(listLocalesWithAlt(alts)),
      }
      return [mediaId, ruleMedia] as const
    }),
  )
  return new Map(entries.filter((entry) => entry !== null))
}
