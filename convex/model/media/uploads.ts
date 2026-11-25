import { type Infer, v } from 'convex/values'

import { internal } from '../../_generated/api'
import type { Id } from '../../_generated/dataModel'
import type { ActionCtx, MutationCtx, QueryCtx } from '../../_generated/server'
import type { MediaStorageSettings } from '../env'
import {
  type AcceptedUpload,
  checkUploadRequest,
  MAX_MEDIA_BYTES,
  toIncomingObjectKeyFromUpload,
  toObjectKeyFromUpload,
  uploadRefusalReasonValidator,
  type UploadRequest,
} from './files'
import {
  copyStoredObject,
  deleteStoredObject,
  readStoredObject,
  signUploadUrl,
  type StoredObject,
} from './storage'

/**
 * An upload in two calls around the browser's PUT (README "Upload"):
 * `createUploadUrl` checks the request and signs a PUT under `incoming/`
 * (never for a request that is already media); `completeUpload` checks what
 * R2 holds, moves it under `media/` and records it. Both are keyed by the
 * request id, so a retry of either repeats, not doubles.
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
export type UploadUrlOutcome = Infer<typeof uploadUrlOutcomeValidator>

export async function createSignedUpload(
  ctx: ActionCtx,
  request: UploadRequest,
  settings: MediaStorageSettings | null,
): Promise<UploadUrlOutcome> {
  const checked = checkUploadRequest(request)
  if (checked.kind === 'refused') {
    return checked
  }
  if (settings === null) {
    return { kind: 'not-configured' }
  }
  const { upload } = checked
  if ((await findRecordedMedia(ctx, upload.requestId)) !== null) {
    return { kind: 'refused', reason: 'already-recorded' }
  }
  const uploadUrl = await signUploadUrl(
    settings,
    toIncomingObjectKeyFromUpload(upload),
    upload,
  )
  return { kind: 'ready', uploadUrl }
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
  const recordedId = await findRecordedMedia(ctx, upload.requestId)
  if (recordedId !== null) {
    return { kind: 'recorded', mediaId: recordedId }
  }
  const placement = await moveIncomingToMedia(settings, upload)
  if (placement !== 'placed') {
    return { kind: 'refused', reason: placement }
  }
  const mediaId: Id<'media'> = await ctx.runMutation(
    internal.media.recordUploadedMedia,
    { ...upload, objectKey: toObjectKeyFromUpload(upload) },
  )
  return { kind: 'recorded', mediaId }
}

function findRecordedMedia(
  ctx: ActionCtx,
  requestId: string,
): Promise<Id<'media'> | null> {
  return ctx.runQuery(internal.media.findUploadedMedia, { requestId })
}

/**
 * Checks the incoming object and moves it to the media key. A retry after a
 * move whose answer was lost finds the media object already in place.
 */
async function moveIncomingToMedia(
  settings: MediaStorageSettings,
  upload: AcceptedUpload,
): Promise<'placed' | 'not-uploaded' | 'mismatch'> {
  const incomingKey = toIncomingObjectKeyFromUpload(upload)
  const objectKey = toObjectKeyFromUpload(upload)
  const incoming = await readStoredObject(settings, incomingKey)
  if (incoming === null) {
    const placed = await readStoredObject(settings, objectKey)
    return placed !== null && isStoredAsAnnounced(placed, upload)
      ? 'placed'
      : 'not-uploaded'
  }
  if (!isStoredAsAnnounced(incoming, upload)) {
    await deleteStoredObject(settings, incomingKey)
    return 'mismatch'
  }
  await copyStoredObject(settings, { from: incomingKey, to: objectKey })
  await deleteStoredObject(settings, incomingKey)
  return 'placed'
}

/** The signature fixes type and size; both are checked again on the object. */
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
