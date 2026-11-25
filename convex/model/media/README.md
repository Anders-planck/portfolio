# Media

Domain code behind `convex/media.ts` (ADR 0014, story 41): images and files on R2, their alt text per locale, where they are used. The functions there are thin: owner check, one call here, return.

## Flow

- **Upload** (`uploads.ts`, client in `src/features/media-upload/`):
  1. The CMS re-encodes an image on a canvas (EXIF and every other metadata block dropped, orientation baked in; the name's extension follows the encoded type) and reads its pixel size; a PDF goes as it is.
  2. Action `createUploadUrl`: `files.ts` checks the request (the server's allowlist and size limit; pixel size for images), a request id that is already media is refused (`already-recorded`: a new PUT could replace a live file), and `storage.ts` signs a PUT for `incoming/<requestId>/<safe-name>` with `Content-Type` and `Content-Length` in the signature, valid 5 minutes.
  3. The browser PUTs the file straight to R2 (the bucket's CORS rule allows the site origins).
  4. Action `completeUpload`: a media already recorded for the request id is returned as is; otherwise a signed HEAD reads what R2 holds under `incoming/` (Zod), another type or size is `mismatch` (the object is deleted), a match is copied to `media/<requestId>/<safe-name>` and the incoming object deleted, and the internal mutation records the media once per request id. Nothing under `incoming/` is used by the site; the bucket's lifecycle rule expires what a lost upload leaves there.
- **Alt** (`alts.ts`): `saveAlt` stores the owner's alt for one locale as `reviewed` (trimmed, at most 300 characters, images only). A blank alt is refused as a typed result (`empty`); a decorative image would be an explicit flag of its own. The AI assistant (ticket 14) will write `to-review` ones.
- **References** (`references.ts`, pure): the one place that knows each collection's media fields: the Profile's `cvMediaId` (shared, must be a file) and every `::figure{media="…"}` of a note body (in that body's locale, must be an image). Ids are kept as written; readers normalise them.
- **Usage** (`usage.ts`): read on each `listMedia` from the drafts and the live versions of every document, through `references.ts`. No usage table: a derived copy could drift from what the site shows.
- **Media rule** (`content/mediarule.ts`, in `PUBLISH_RULES`, all block): every referenced media exists and is the kind its field shows (the CV a PDF, a figure an image); an image has alt in the locales that show it (a figure: its body's locale; a shared field: every locale of the document). `rulemedia.ts` reads only the referenced media. The note editor shows the same findings live.
- **Variants** (`variants.ts`, pure): Cloudflare Image transformation URLs `<IMAGE_TRANSFORM_ORIGIN>/cdn-cgi/image/width=…,fit=scale-down,format=auto,metadata=none/<original>` for widths 390, 780, 1170, 1440, 2160 up to the original's. `format=auto` serves AVIF or WebP. Without `IMAGE_TRANSFORM_ORIGIN` the original is the only source. Nothing is stored per variant.
- **Figures** (`figures.ts`): the note views read the images their figures name (sources, pixel size, alt per locale); `notes/render.ts` renders a figure with the alt of the page's locale and leaves it out when the image or that alt is missing. The Media screen shows the `::figure` directive of each image to copy.
- **CV** (`cv.ts`): the public `getPublishedCv` reads the published Profile's `cvMediaId` and returns its public URL when it is a PDF; the header and footer link to it.

## Files

| File | Owns |
|---|---|
| `tables.ts` | `media` and `mediaAlt` (spread into the schema), alt review states. |
| `files.ts` | Allowlist, size limits, request checks, object keys (pure). |
| `storage.ts` | The R2 S3 API: presigned PUT, HEAD, copy, DELETE, public URLs. |
| `uploads.ts` | The two upload steps and recording a media once. |
| `alts.ts` | Alt records: reading, the owner's save. |
| `references.ts` | Where a document points at media, and which kind each field shows (pure). |
| `figures.ts` | The images note figures show, for rendering. |
| `written.ts` | Media named by ids as documents write them, with their written alt (rule and figures). |
| `usage.ts` | Which documents use which media, drafts and live. |
| `rulemedia.ts` | What the media rule knows about referenced media. |
| `library.ts` | The CMS Media listing. |
| `variants.ts` | Image transformation URLs (pure). |
| `cv.ts` | The published CV. |
| `storage.fixture.ts` | Media env and an in-memory bucket behind `fetch`, for convex-test. |

## Env (`model/env.ts`)

`R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `MEDIA_PUBLIC_ORIGIN`: all or none (none: Media says storage is not configured). `IMAGE_TRANSFORM_ORIGIN` optional. `R2_ENDPOINT` only for the local fake on a local backend (`scripts/fake-r2/`, Playwright).

## Invariants

- The browser never holds R2 keys: it gets one signed PUT for one key, type and size, and never for a request that is already media.
- One upload request id is at most one media; retries and double clicks repeat it.
- Media and alt are live data, not released content: an alt saved now shows wherever a live document already uses the image. Publishing is what the media rule guards.
- Only images take alt text; files never block a publish for it.
- The site only reads `media/`; `incoming/` holds unchecked uploads and is expired by the bucket.
