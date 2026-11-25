# Media

Domain code behind `convex/media.ts` (ADR 0014, story 41): images and files on R2, their alt text per locale, where they are used. The functions there are thin: owner check, one call here, return.

## Flow

- **Upload** (`uploads.ts`, client in `src/features/media-upload/`):
  1. The CMS re-encodes an image on a canvas (EXIF and every other metadata block dropped, orientation baked in) and reads its pixel size; a PDF goes as it is.
  2. Action `createUploadUrl`: `files.ts` checks the request (allowlist JPEG, PNG, WebP, PDF; up to 10 MB; pixel size for images) and `storage.ts` signs a PUT for `media/<requestId>/<safe-name>` with `Content-Type` in the signature (15 minutes). A refusal or missing storage env is a typed result.
  3. The browser PUTs the file straight to R2 (the bucket's CORS rule allows the site origins).
  4. Action `completeUpload`: a media already recorded for the request id is returned as is; otherwise a signed HEAD reads what R2 holds (Zod), a missing object is `not-uploaded`, another type or size is `mismatch` (the object is deleted), and the internal mutation records the media once per request id.
- **Alt** (`alts.ts`): `saveAlt` stores the owner's alt for one locale as `reviewed` (trimmed, at most 300 characters, images only). The AI assistant (ticket 14) will write `to-review` ones.
- **Usage** (`usage.ts`): read on each `listMedia` from the drafts and the live versions of every document, through `references.ts`, the one place that knows each collection's media fields (today the Profile's `cvMediaId`). No usage table: a derived copy could drift from what the site shows.
- **Alt rule** (`content/altrule.ts`, in `PUBLISH_RULES`): every image a document points at has alt in each locale the document has content in; a reference to missing media blocks too. `rulemedia.ts` reads only the referenced media for the rule context.
- **Variants** (`variants.ts`, pure): Cloudflare Image transformation URLs `<IMAGE_TRANSFORM_ORIGIN>/cdn-cgi/image/width=…,fit=scale-down,format=auto,metadata=none/<original>` for widths 390, 780, 1170, 1440, 2160 up to the original's. `format=auto` serves AVIF or WebP. Without `IMAGE_TRANSFORM_ORIGIN` the original is the only source. Nothing is stored per variant.
- **CV** (`cv.ts`): the public `getPublishedCv` reads the published Profile's `cvMediaId` and returns its public URL; the header and footer link to it.

## Files

| File | Owns |
|---|---|
| `tables.ts` | `media` and `mediaAlt` (spread into the schema), alt review states. |
| `files.ts` | Allowlist, size limits, request checks, object keys (pure). |
| `storage.ts` | The R2 S3 API: presigned PUT, HEAD, DELETE, public URLs. |
| `uploads.ts` | The two upload steps and recording a media once. |
| `alts.ts` | Alt records: reading, the owner's save. |
| `references.ts` | Where a document points at media (pure). |
| `usage.ts` | Which documents use which media, drafts and live. |
| `rulemedia.ts` | What the alt rule knows about referenced media. |
| `library.ts` | The CMS Media listing. |
| `variants.ts` | Image transformation URLs (pure). |
| `cv.ts` | The published CV. |
| `storage.fixture.ts` | Media env and an in-memory bucket behind `fetch`, for convex-test. |

## Env (`model/env.ts`)

`R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `MEDIA_PUBLIC_ORIGIN`: all or none (none: Media says storage is not configured). `IMAGE_TRANSFORM_ORIGIN` optional. `R2_ENDPOINT` only for the local fake on a local backend (`scripts/fake-r2/`, Playwright).

## Invariants

- The browser never holds R2 keys: it gets one signed PUT for one key and type.
- One upload request id is at most one media; retries and double clicks repeat it.
- Media and alt are live data, not released content: an alt saved now shows wherever a live document already uses the image. Publishing is what the alt rule guards.
- Only images take alt text; files never block a publish for it.
