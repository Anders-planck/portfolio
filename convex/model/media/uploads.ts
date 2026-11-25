import { type Infer, v } from 'convex/values'

import { internal } from '../../_generated/api'
import type { Id } from '../../_generated/dataModel'
import type { ActionCtx, MutationCtx, QueryCtx } from '../../_generated/server'
import type { MediaStorageSettings } from '../env'
import {
  type AcceptedUpload,
  checkUploadRequest,
  MAX_MEDIA_BYTES,
  toObjectKeyFromUpload,
  uploadRefusalReasonValidator,
  type UploadRequest,
} from './files'
import {
  deleteStoredObject,
  readStoredObject,
  signUploadUrl,
  type StoredObject,
} from './storage'

/**
 * An upload in two calls around the browser's PUT (README "Upload"):
 * `createUploadUrl` checks the request and signs a PUT for its object;
 * `completeUpload` checks what R2 now holds and records the media. Both
 * are keyed by the request id, so a retry of either repeats, not doubles.
 */

const notConfiguredValidator = v.object({ kind: v.literal('not-configured') })
const refusedValidator = v.object({
  kind: v.literal('refused'),
  reason: uploadRefusalReasonValidator,
})

export const uploadUrlOutcomeValidator = v.union(
  v.object({ kind: v.literal('ready'), uploadUrl: v.string() }),
  refusedValidator,
  notConfiguredValidator,
)

export const uploadCompletionValidator = v.union(
  v.object({ kind: v.literal('recorded'), mediaId: v.id('media') }),
  refusedValidator,
  notConfiguredValidator,
)
export type UploadCompletion = Infer<typeof uploadCompletionValidator>

export async function createSignedUpload(
  request: UploadRequest,
  settings: MediaStorageSettings | null,
) {
  const checked = checkUploadRequest(request)
  if (checked.kind === 'refused') {
    return checked
  }
  if (settings === null) {
    return { kind: 'not-configured' as const }
  }
  const { upload } = checked
  const uploadUrl = await signUploadUrl(
    settings,
    toObjectKeyFromUpload(upload),
    upload.mime,
  )
  return { kind: 'ready' as const, uploadUrl }
}

export async function recordStoredUpload(
  ctx: ActionCtx,
  request: UploadRequest,
  settings: MediaStorageSettings | null,
): Promise<UploadCompletion> {
  const checked = checkUploadRequest(request)
  if (checked.kind === 'refused') {
    return checked
  }
  if (settings === null) {
    return { kind: 'not-configured' }
  }
  const { upload } = checked
  const recordedId: Id<'media'> | null = await ctx.runQuery(
    internal.media.findUploadedMedia,
    {
      requestId: upload.requestId,
    },
  )
  if (recordedId !== null) {
    return { kind: 'recorded', mediaId: recordedId }
  }
  const objectKey = toObjectKeyFromUpload(upload)
  const stored = await readStoredObject(settings, objectKey)
  if (stored === null) {
    return { kind: 'refused', reason: 'not-uploaded' }
  }
  if (!isStoredAsAnnounced(stored, upload)) {
    await deleteStoredObject(settings, objectKey)
    return { kind: 'refused', reason: 'mismatch' }
  }
  const mediaId: Id<'media'> = await ctx.runMutation(
    internal.media.recordUploadedMedia,
    {
      ...upload,
      objectKey,
    },
  )
  return { kind: 'recorded', mediaId }
}

/** The presigned PUT fixes the type, not the size: both are checked here. */
function isStoredAsAnnounced(stored: StoredObject, upload: AcceptedUpload) {
  return (
    stored.contentType === upload.mime &&
    stored.contentLength === upload.bytes &&
    stored.contentLength <= MAX_MEDIA_BYTES
  )
}

export async function findMediaByUploadRequest(
  ctx: QueryCtx,
  requestId: string,
): Promise<Id<'media'> | null> {
  const media = await ctx.db
    .query('media')
    .withIndex('by_upload_request_id', (query) =>
      query.eq('uploadRequestId', requestId),
    )
    .unique()
  return media?._id ?? null
}

/** Records the checked upload once; a repeated completion returns the same media. */
export async function insertUploadedMediaOnce(
  ctx: MutationCtx,
  upload: AcceptedUpload & { objectKey: string },
  now: number,
): Promise<Id<'media'>> {
  const existing = await findMediaByUploadRequest(ctx, upload.requestId)
  if (existing !== null) {
    return existing
  }
  return ctx.db.insert('media', {
    objectKey: upload.objectKey,
    fileName: upload.fileName.trim(),
    mime: upload.mime,
    bytes: upload.bytes,
    widthPx: upload.widthPx,
    heightPx: upload.heightPx,
    uploadRequestId: upload.requestId,
    uploadedAt: now,
  })
}
