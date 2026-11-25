import type { FunctionArgs, FunctionReturnType } from 'convex/server'

import type { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import type { UploadableFile } from './to-uploadable-file'

type UploadRequest = FunctionArgs<typeof api.media.createUploadUrl>
type UploadUrlOutcome = FunctionReturnType<typeof api.media.createUploadUrl>
type UploadCompletion = FunctionReturnType<typeof api.media.completeUpload>
type UploadRefusalReason = Extract<
  UploadCompletion,
  { kind: 'refused' }
>['reason']

/** Why an upload did not end as media; `not-stored`: R2 refused the PUT. */
export type UploadProblem =
  UploadRefusalReason | 'not-configured' | 'not-stored'

export type UploadOutcome =
  | { kind: 'recorded'; mediaId: Id<'media'> }
  | { kind: 'failed'; problem: UploadProblem }

/** The three steps of an upload, injected so the flow is tested without a backend. */
export interface UploadCommands {
  createUploadUrl: (request: UploadRequest) => Promise<UploadUrlOutcome>
  completeUpload: (request: UploadRequest) => Promise<UploadCompletion>
  /** The browser's PUT to R2; true when R2 stored it. */
  putObject: (uploadUrl: string, body: Blob, mime: string) => Promise<boolean>
}

/**
 * Uploads one file (README "Upload"): signed URL, PUT straight to R2,
 * completion. The same `requestId` on a retry repeats the same upload, so
 * a lost answer never records the file twice (DATA-06).
 */
export async function uploadMediaFile(
  file: UploadableFile,
  requestId: string,
  commands: UploadCommands,
): Promise<UploadOutcome> {
  const request: UploadRequest = {
    requestId,
    fileName: file.fileName,
    mime: file.mime,
    bytes: file.body.size,
    widthPx: file.widthPx,
    heightPx: file.heightPx,
  }
  const signed = await commands.createUploadUrl(request)
  if (signed.kind !== 'ready') {
    return toFailure(signed)
  }
  const isStored = await commands.putObject(
    signed.uploadUrl,
    file.body,
    file.mime,
  )
  if (!isStored) {
    return { kind: 'failed', problem: 'not-stored' }
  }
  const completion = await commands.completeUpload(request)
  return completion.kind === 'recorded' ? completion : toFailure(completion)
}

function toFailure(
  outcome:
    | { kind: 'refused'; reason: UploadRefusalReason }
    | { kind: 'not-configured' },
): UploadOutcome {
  return {
    kind: 'failed',
    problem: outcome.kind === 'refused' ? outcome.reason : 'not-configured',
  }
}

/** The PUT the presigned URL allows: its `Content-Type` is part of the signature. */
export async function putObjectToStorage(
  uploadUrl: string,
  body: Blob,
  mime: string,
): Promise<boolean> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mime },
    body,
  })
  return response.ok
}
