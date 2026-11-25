import { AwsClient } from 'aws4fetch'
import { z } from 'zod'

import type { MediaStorageSettings } from '../env'

/**
 * The R2 bucket through its S3 API, signed with SigV4 (`aws4fetch`: small,
 * WebCrypto only, so it runs in the default Convex runtime). Browsers upload
 * straight to R2 with a presigned PUT; the backend only signs and checks.
 */

/** The browser PUTs right after signing; a leaked URL is short-lived. */
const UPLOAD_URL_TTL_SECONDS = 5 * 60

function toS3Client(settings: MediaStorageSettings) {
  return new AwsClient({
    accessKeyId: settings.accessKeyId,
    secretAccessKey: settings.secretAccessKey,
    service: 's3',
    region: 'auto',
    // No silent retries: the CMS shows the failure and the owner retries.
    retries: 0,
  })
}

/** Path-style object URL on the S3 endpoint (keys are URL-safe, README). */
function toObjectUrl(settings: MediaStorageSettings, objectKey: string) {
  return `${settings.endpoint}/${settings.bucket}/${objectKey}`
}

/** Where the site reads an object: the bucket's public origin. */
export function toPublicObjectUrl(publicOrigin: string, objectKey: string) {
  return `${publicOrigin}/${objectKey}`
}

/**
 * A presigned PUT for one object. `Content-Type` and `Content-Length` are
 * part of the signature, so R2 refuses an upload of another type or size
 * than the one checked (the browser sets the length from the body).
 */
export async function signUploadUrl(
  settings: MediaStorageSettings,
  objectKey: string,
  { mime, bytes }: { mime: string; bytes: number },
): Promise<string> {
  const url = new URL(toObjectUrl(settings, objectKey))
  url.searchParams.set('X-Amz-Expires', String(UPLOAD_URL_TTL_SECONDS))
  const signed = await toS3Client(settings).sign(url.toString(), {
    method: 'PUT',
    headers: { 'Content-Type': mime, 'Content-Length': String(bytes) },
    aws: { signQuery: true, allHeaders: true },
  })
  return signed.url
}

/** Copies an object inside the bucket (S3 CopyObject), server side. */
export async function copyStoredObject(
  settings: MediaStorageSettings,
  { from, to }: { from: string; to: string },
) {
  const response = await toS3Client(settings).fetch(toObjectUrl(settings, to), {
    method: 'PUT',
    headers: { 'x-amz-copy-source': `/${settings.bucket}/${from}` },
  })
  if (!response.ok) {
    throw new Error(`R2 answered ${String(response.status)} to a copy`)
  }
}

const storedObjectHeadersSchema = z.object({
  // A HEAD answer without a size is a broken reply, not an empty file.
  contentLength: z.string().regex(/^\d+$/).transform(Number),
  contentType: z.string().min(1),
})
export type StoredObject = z.infer<typeof storedObjectHeadersSchema>

/** What R2 holds at `objectKey` (size and type), or null if nothing. */
export async function readStoredObject(
  settings: MediaStorageSettings,
  objectKey: string,
): Promise<StoredObject | null> {
  const response = await toS3Client(settings).fetch(
    toObjectUrl(settings, objectKey),
    { method: 'HEAD' },
  )
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(`R2 answered ${String(response.status)} to HEAD`)
  }
  return storedObjectHeadersSchema.parse({
    contentLength: response.headers.get('content-length'),
    contentType: response.headers.get('content-type'),
  })
}

/** Removes an object; removing one that is not there is not an error. */
export async function deleteStoredObject(
  settings: MediaStorageSettings,
  objectKey: string,
) {
  const response = await toS3Client(settings).fetch(
    toObjectUrl(settings, objectKey),
    { method: 'DELETE' },
  )
  if (!response.ok && response.status !== 404) {
    throw new Error(`R2 answered ${String(response.status)} to DELETE`)
  }
}
