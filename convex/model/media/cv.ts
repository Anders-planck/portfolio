import { type Infer, v } from 'convex/values'

import type { QueryCtx } from '../../_generated/server'
import { readPublishedDocument } from '../content/pointers'
import { readMediaStorageSettings } from '../env'
import { toMediaKindFromMime } from './files'
import { toPublicObjectUrl } from './storage'

/** The CV the header and footer link to: the published Profile's file. */
export const publishedCvValidator = v.union(
  v.object({ url: v.string(), fileName: v.string() }),
  v.null(),
)
export type PublishedCv = Infer<typeof publishedCvValidator>

/**
 * Null until a Profile with a CV is published, and while storage is not
 * configured. Shared fields are the same in every locale, so any one reads it.
 */
export async function readPublishedCv(ctx: QueryCtx): Promise<PublishedCv> {
  const profile = await readPublishedDocument(
    ctx,
    { collection: 'profile', key: 'main' },
    'it',
  )
  const cvMediaId =
    profile?.collection === 'profile'
      ? (profile.fields.cvMediaId ?? null)
      : null
  const settings = readMediaStorageSettings()
  if (cvMediaId === null || settings === null) {
    return null
  }
  const media = await ctx.db.get(cvMediaId)
  // The media rule blocks a CV that is not a PDF; this guards older versions.
  if (media === null || toMediaKindFromMime(media.mime) !== 'file') {
    return null
  }
  return {
    url: toPublicObjectUrl(settings.publicOrigin, media.objectKey),
    fileName: media.fileName,
  }
}
