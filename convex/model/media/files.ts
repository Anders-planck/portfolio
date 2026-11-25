import { type Infer, v } from 'convex/values'

/**
 * What the owner may upload (pure). Images arrive already re-encoded by the
 * CMS, so they carry no EXIF (README "EXIF"); PDFs are files, linked as they
 * are (the CV).
 */

export const mediaMimeValidator = v.union(
  v.literal('image/jpeg'),
  v.literal('image/png'),
  v.literal('image/webp'),
  v.literal('application/pdf'),
)
export type MediaMime = Infer<typeof mediaMimeValidator>

export const MEDIA_MIMES: readonly MediaMime[] = mediaMimeValidator.members.map(
  (member) => member.value,
)

export function isMediaMime(value: string): value is MediaMime {
  return MEDIA_MIMES.some((mime) => mime === value)
}

/** Images get alt text and variants; files are only linked. */
export const mediaKindValidator = v.union(v.literal('image'), v.literal('file'))
export type MediaKind = Infer<typeof mediaKindValidator>

export function toMediaKindFromMime(mime: MediaMime): MediaKind {
  return mime === 'application/pdf' ? 'file' : 'image'
}

const MEGABYTE = 1024 * 1024

/** The largest upload: a re-encoded screenshot or a CV stays well under it. */
export const MAX_MEDIA_BYTES = 10 * MEGABYTE

/** Larger sides than this are not screenshots; transformations cap near it too. */
export const MAX_IMAGE_SIDE_PX = 12_000

export const MAX_FILE_NAME_LENGTH = 200

/** What the CMS says about a file before and after it reaches storage. */
export const uploadRequestValidator = v.object({
  /** One per chosen file; repeating it repeats the same upload (DATA-06). */
  requestId: v.string(),
  fileName: v.string(),
  mime: v.string(),
  bytes: v.number(),
  /** Pixel size of an image; null for a file. */
  widthPx: v.union(v.number(), v.null()),
  heightPx: v.union(v.number(), v.null()),
})
export type UploadRequest = Infer<typeof uploadRequestValidator>

export const uploadRefusalReasonValidator = v.union(
  v.literal('type-not-allowed'),
  v.literal('too-large'),
  v.literal('empty'),
  v.literal('bad-name'),
  v.literal('bad-size'),
  /** Storage holds no object for the request: the upload never finished. */
  v.literal('not-uploaded'),
  /** Storage holds another type or size than the CMS announced. */
  v.literal('mismatch'),
)
export type UploadRefusalReason = Infer<typeof uploadRefusalReasonValidator>

/** An upload request that passed every check. */
export type AcceptedUpload = Omit<UploadRequest, 'mime'> & { mime: MediaMime }

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

/** A malformed request id is a CMS bug, not an owner mistake: it throws. */
export function checkUploadRequestId(requestId: string) {
  if (!UUID_PATTERN.test(requestId)) {
    throw new Error('An upload request id is a lowercase UUID')
  }
}

/** The request as an accepted upload, or why it is refused. */
export function checkUploadRequest(
  request: UploadRequest,
):
  | { kind: 'accepted'; upload: AcceptedUpload }
  | { kind: 'refused'; reason: UploadRefusalReason } {
  checkUploadRequestId(request.requestId)
  const { mime } = request
  if (!isMediaMime(mime)) {
    return { kind: 'refused', reason: 'type-not-allowed' }
  }
  const reason = findSizeOrNameProblem({ ...request, mime })
  return reason === null
    ? { kind: 'accepted', upload: { ...request, mime } }
    : { kind: 'refused', reason }
}

function findSizeOrNameProblem(
  upload: AcceptedUpload,
): UploadRefusalReason | null {
  if (!Number.isInteger(upload.bytes) || upload.bytes <= 0) {
    return 'empty'
  }
  if (upload.bytes > MAX_MEDIA_BYTES) {
    return 'too-large'
  }
  const name = upload.fileName.trim()
  if (name === '' || name.length > MAX_FILE_NAME_LENGTH) {
    return 'bad-name'
  }
  return hasExpectedPixelSize(upload) ? null : 'bad-size'
}

/** An image has a whole pixel size within bounds; a file has none. */
function hasExpectedPixelSize({ mime, widthPx, heightPx }: AcceptedUpload) {
  if (toMediaKindFromMime(mime) === 'file') {
    return widthPx === null && heightPx === null
  }
  return isPixelSide(widthPx) && isPixelSide(heightPx)
}

function isPixelSide(side: number | null) {
  return (
    side !== null &&
    Number.isInteger(side) &&
    side > 0 &&
    side <= MAX_IMAGE_SIDE_PX
  )
}

/**
 * Where an upload lives in the bucket: one folder per request, so a retry
 * writes the same object and two files with one name never collide. The
 * name keeps only URL-safe characters; the original stays in `fileName`.
 */
export function toObjectKeyFromUpload({
  requestId,
  fileName,
}: Pick<UploadRequest, 'requestId' | 'fileName'>) {
  const safeName = fileName
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `media/${requestId}/${safeName === '' ? 'file' : safeName}`
}
