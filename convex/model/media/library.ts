import { type Infer, v } from 'convex/values'

import type { Doc } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'
import { LOCALES, localeValidator } from '../content/locales'
import { readImageTransformOrigin, readMediaStorageSettings } from '../env'
import { listLocalesWithAlt, MAX_ALT_LENGTH, readAltRecords } from './alts'
import {
  MAX_MEDIA_BYTES,
  MEDIA_MIMES,
  mediaMimeValidator,
  toMediaKindFromMime,
} from './files'
import { toPublicObjectUrl } from './storage'
import { altReviewStateValidator, MAX_MEDIA } from './tables'
import { type MediaUsage, mediaUsageValidator, readMediaUsages } from './usage'
import { imageSourcesValidator, toImageSources } from './variants'

/** CMS Media: every upload with its alt per locale and where it is used. */

const mediaEntryValidator = v.object({
  mediaId: v.id('media'),
  fileName: v.string(),
  mime: mediaMimeValidator,
  kind: v.union(v.literal('image'), v.literal('file')),
  bytes: v.number(),
  widthPx: v.union(v.number(), v.null()),
  heightPx: v.union(v.number(), v.null()),
  uploadedAt: v.number(),
  /** The original on the public origin; null while storage is not configured. */
  url: v.union(v.string(), v.null()),
  /** Image sources for a preview (variants when transformations are on). */
  preview: v.union(imageSourcesValidator, v.null()),
  alts: v.array(
    v.object({
      locale: localeValidator,
      alt: v.string(),
      reviewState: altReviewStateValidator,
    }),
  ),
  /** Site locales without alt text; empty for a file, which needs none. */
  missingAltLocales: v.array(localeValidator),
  usages: v.array(mediaUsageValidator),
})
export type MediaEntry = Infer<typeof mediaEntryValidator>

export const mediaLibraryValidator = v.object({
  isStorageConfigured: v.boolean(),
  /** Whether images are served as AVIF/WebP variants or as uploaded. */
  hasImageVariants: v.boolean(),
  /** The server's limits, so the CMS picker and fields never copy them. */
  limits: v.object({
    acceptedMimes: v.array(mediaMimeValidator),
    maxBytes: v.number(),
    maxAltLength: v.number(),
  }),
  media: v.array(mediaEntryValidator),
})

export async function readMediaLibrary(ctx: QueryCtx) {
  const settings = readMediaStorageSettings()
  const transformOrigin = readImageTransformOrigin()
  const [rows, usages] = await Promise.all([
    ctx.db.query('media').order('desc').take(MAX_MEDIA),
    readMediaUsages(ctx),
  ])
  const media = await Promise.all(
    rows.map(async (row) =>
      toMediaEntry(row, {
        publicOrigin: settings?.publicOrigin ?? null,
        transformOrigin,
        alts: await readAltRecords(ctx, row._id),
        usages: usages.get(row._id) ?? [],
      }),
    ),
  )
  return {
    isStorageConfigured: settings !== null,
    hasImageVariants: transformOrigin !== null,
    limits: {
      acceptedMimes: [...MEDIA_MIMES],
      maxBytes: MAX_MEDIA_BYTES,
      maxAltLength: MAX_ALT_LENGTH,
    },
    media,
  }
}

function toMediaEntry(
  row: Doc<'media'>,
  related: {
    publicOrigin: string | null
    transformOrigin: string | null
    alts: Doc<'mediaAlt'>[]
    usages: MediaUsage[]
  },
): MediaEntry {
  const kind = toMediaKindFromMime(row.mime)
  const url =
    related.publicOrigin === null
      ? null
      : toPublicObjectUrl(related.publicOrigin, row.objectKey)
  const preview =
    url === null || kind !== 'image' || row.widthPx === null
      ? null
      : toImageSources(
          { originalUrl: url, widthPx: row.widthPx },
          related.transformOrigin,
        )
  return {
    mediaId: row._id,
    fileName: row.fileName,
    mime: row.mime,
    kind,
    bytes: row.bytes,
    widthPx: row.widthPx,
    heightPx: row.heightPx,
    uploadedAt: row.uploadedAt,
    url,
    preview,
    alts: related.alts.map(({ locale, alt, reviewState }) => ({
      locale,
      alt,
      reviewState,
    })),
    missingAltLocales: toMissingAltLocales(kind, related.alts),
    usages: related.usages,
  }
}

function toMissingAltLocales(
  kind: MediaEntry['kind'],
  alts: Doc<'mediaAlt'>[],
): MediaEntry['missingAltLocales'] {
  if (kind === 'file') {
    return []
  }
  const withAlt = listLocalesWithAlt(alts)
  return LOCALES.filter((locale) => !withAlt.includes(locale))
}
