import type { QueryCtx } from '../../_generated/server'
import type { Locale } from '../content/locales'
import type { Snapshot } from '../content/snapshot'
import { type MediaKind, toMediaKindFromMime } from './files'
import { findMediaReferences } from './references'
import { readWrittenMedia } from './written'

/** What the media rule needs to know about one referenced media. */
export interface RuleMedia {
  kind: MediaKind
  fileName: string
  /** Locales whose alt text is written. */
  altLocales: ReadonlySet<Locale>
}

/**
 * The media `snapshots` point at, by the id as written. An id that names
 * no media is left out: the rule reports it missing.
 */
export async function readRuleMedia(
  ctx: QueryCtx,
  snapshots: Snapshot[],
): Promise<Map<string, RuleMedia>> {
  const written = await readWrittenMedia(
    ctx,
    snapshots.flatMap((snapshot) =>
      findMediaReferences(snapshot).map((reference) => reference.mediaId),
    ),
  )
  return new Map(
    [...written].map(([writtenId, { media, altByLocale }]) => [
      writtenId,
      {
        kind: toMediaKindFromMime(media.mime),
        fileName: media.fileName,
        altLocales: new Set(altByLocale.keys()),
      },
    ]),
  )
}
