import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { api } from './_generated/api'
import type { Id } from './_generated/dataModel'
import type { UploadRequest } from './model/media/files'
import {
  stubMediaStorageEnv,
  stubR2Bucket,
  TEST_MEDIA_ORIGIN,
  TEST_R2_BUCKET,
  TEST_R2_ENDPOINT,
} from './model/media/storage.fixture'
import { createOwnerBackend, type SignedInBackend } from './owner.fixture'

const NOW = Date.UTC(2026, 10, 25, 9)
const REQUEST_ID = '0f8b3c52-6f0e-4a7e-9a59-1f9e8d6b2c11'
const OBJECT_KEY = `media/${REQUEST_ID}/bussola-chat.png`

const SCREENSHOT: UploadRequest = {
  requestId: REQUEST_ID,
  fileName: 'bussola-chat.png',
  mime: 'image/png',
  bytes: 240_000,
  widthPx: 1440,
  heightPx: 900,
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

async function createConfiguredOwner() {
  const owner = await createOwnerBackend()
  stubMediaStorageEnv()
  return { owner, bucket: stubR2Bucket() }
}

/** Upload URL, the browser's PUT, completion: the whole "Carica". */
async function uploadScreenshot(
  owner: SignedInBackend,
  bucket: ReturnType<typeof stubR2Bucket>,
) {
  await owner.action(api.media.createUploadUrl, SCREENSHOT)
  bucket.putObject(OBJECT_KEY, {
    contentType: 'image/png',
    contentLength: SCREENSHOT.bytes,
  })
  const completion = await owner.action(api.media.completeUpload, SCREENSHOT)
  if (completion.kind !== 'recorded') {
    throw new Error(`Expected a recorded upload, got ${completion.kind}`)
  }
  return completion.mediaId
}

describe('upload URL', () => {
  test('the owner gets a presigned PUT for the object, with its type signed', async () => {
    const { owner } = await createConfiguredOwner()

    const outcome = await owner.action(api.media.createUploadUrl, SCREENSHOT)

    expect(outcome.kind).toBe('ready')
    if (outcome.kind === 'ready') {
      const url = new URL(outcome.uploadUrl)
      expect(`${url.origin}${url.pathname}`).toBe(
        `${TEST_R2_ENDPOINT}/${TEST_R2_BUCKET}/${OBJECT_KEY}`,
      )
      expect(url.searchParams.get('X-Amz-SignedHeaders')).toBe(
        'content-type;host',
      )
      expect(url.searchParams.get('X-Amz-Expires')).toBe('900')
      expect(url.searchParams.get('X-Amz-Signature')).toMatch(/^[0-9a-f]{64}$/)
    }
  })

  test('a type outside the allowlist gets no URL', async () => {
    const { owner } = await createConfiguredOwner()

    expect(
      await owner.action(api.media.createUploadUrl, {
        ...SCREENSHOT,
        mime: 'image/svg+xml',
      }),
    ).toEqual({ kind: 'refused', reason: 'type-not-allowed' })
  })

  test('without the R2 env the CMS is told storage is not configured', async () => {
    const owner = await createOwnerBackend()

    expect(await owner.action(api.media.createUploadUrl, SCREENSHOT)).toEqual({
      kind: 'not-configured',
    })
  })
})

describe('completing an upload', () => {
  test('a stored upload becomes media with its public URL and no usage yet', async () => {
    const { owner, bucket } = await createConfiguredOwner()

    await uploadScreenshot(owner, bucket)

    const library = await owner.query(api.media.listMedia, {})
    expect(library).toMatchObject({
      isStorageConfigured: true,
      hasImageVariants: false,
      media: [
        {
          fileName: 'bussola-chat.png',
          kind: 'image',
          widthPx: 1440,
          url: `${TEST_MEDIA_ORIGIN}/${OBJECT_KEY}`,
          preview: { src: `${TEST_MEDIA_ORIGIN}/${OBJECT_KEY}`, srcSet: null },
          alts: [],
          missingAltLocales: ['it', 'en', 'fr', 'de'],
          usages: [],
        },
      ],
    })
  })

  test('with a transform origin the preview offers AVIF/WebP variants', async () => {
    const { owner, bucket } = await createConfiguredOwner()
    vi.stubEnv('IMAGE_TRANSFORM_ORIGIN', 'https://example.com')

    await uploadScreenshot(owner, bucket)

    const [entry] = (await owner.query(api.media.listMedia, {})).media
    expect(entry?.preview?.srcSet).toContain(
      'https://example.com/cdn-cgi/image/width=390,fit=scale-down,format=auto,metadata=none/',
    )
  })

  test('completing before the PUT arrived is refused and records nothing', async () => {
    const { owner } = await createConfiguredOwner()

    expect(await owner.action(api.media.completeUpload, SCREENSHOT)).toEqual({
      kind: 'refused',
      reason: 'not-uploaded',
    })
    expect((await owner.query(api.media.listMedia, {})).media).toEqual([])
  })

  test('an object of another size than announced is refused and removed', async () => {
    const { owner, bucket } = await createConfiguredOwner()
    bucket.putObject(OBJECT_KEY, {
      contentType: 'image/png',
      contentLength: SCREENSHOT.bytes + 1,
    })

    expect(await owner.action(api.media.completeUpload, SCREENSHOT)).toEqual({
      kind: 'refused',
      reason: 'mismatch',
    })
    expect(bucket.hasObject(OBJECT_KEY)).toBe(false)
  })

  test('completing twice (double click, retry) records one media', async () => {
    const { owner, bucket } = await createConfiguredOwner()
    const mediaId = await uploadScreenshot(owner, bucket)

    expect(await owner.action(api.media.completeUpload, SCREENSHOT)).toEqual({
      kind: 'recorded',
      mediaId,
    })
    expect((await owner.query(api.media.listMedia, {})).media).toHaveLength(1)
  })

  test('a lost connection to R2 fails the call; the retry records the upload', async () => {
    const { owner, bucket } = await createConfiguredOwner()
    bucket.putObject(OBJECT_KEY, {
      contentType: 'image/png',
      contentLength: SCREENSHOT.bytes,
    })
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('fetch failed'))

    await expect(
      owner.action(api.media.completeUpload, SCREENSHOT),
    ).rejects.toThrow()
    expect(
      await owner.action(api.media.completeUpload, SCREENSHOT),
    ).toMatchObject({ kind: 'recorded' })
  })
})

describe('alt text', () => {
  test('the owner’s alt is stored per locale as reviewed', async () => {
    const { owner, bucket } = await createConfiguredOwner()
    const mediaId = await uploadScreenshot(owner, bucket)

    await owner.mutation(api.media.saveAlt, {
      mediaId,
      locale: 'it',
      alt: ' Chat di Bussola con una risposta ',
    })

    const [entry] = (await owner.query(api.media.listMedia, {})).media
    expect(entry?.alts).toEqual([
      {
        locale: 'it',
        alt: 'Chat di Bussola con una risposta',
        reviewState: 'reviewed',
      },
    ])
  })

  test('alt text over the limit is refused', async () => {
    const { owner, bucket } = await createConfiguredOwner()
    const mediaId = await uploadScreenshot(owner, bucket)

    await expect(
      owner.mutation(api.media.saveAlt, {
        mediaId,
        locale: 'it',
        alt: 'a'.repeat(301),
      }),
    ).rejects.toThrow(/at most/)
  })
})

const CV: UploadRequest = {
  requestId: '6a1d0b7e-2c4f-4d8a-b3e9-5f7c1a2b3c4d',
  fileName: 'cv-anders-planck.pdf',
  mime: 'application/pdf',
  bytes: 90_000,
  widthPx: null,
  heightPx: null,
}

/** Saves an Italian Profile draft whose CV slot points at `cvMediaId`. */
async function saveProfilePointingAt(
  owner: SignedInBackend,
  cvMediaId: Id<'media'>,
) {
  return owner.mutation(api.content.saveDraft, {
    collection: 'profile',
    key: 'main',
    fields: { cvMediaId },
    localeEdit: { locale: 'it', content: { subtitle: 'Frontend' } },
  })
}

function publishProfile(owner: SignedInBackend, revision: number) {
  return owner.mutation(api.content.publish, {
    selection: [{ collection: 'profile', key: 'main', revision }],
    note: '',
    requestId: crypto.randomUUID(),
  })
}

describe('publish and usage', () => {
  // The CV slot is the only media field so far; the rule checks the media it
  // points at, whatever the field.
  test('a document pointing at an image without alt in its locale is blocked', async () => {
    const { owner, bucket } = await createConfiguredOwner()
    const mediaId = await uploadScreenshot(owner, bucket)
    const { revision } = await saveProfilePointingAt(owner, mediaId)

    expect(await publishProfile(owner, revision)).toMatchObject({
      status: 'blocked',
      findings: [{ rule: 'missing-alt', locale: 'it', field: 'cvMediaId' }],
    })

    await owner.mutation(api.media.saveAlt, {
      mediaId,
      locale: 'it',
      alt: 'Chat di Bussola',
    })
    expect(await publishProfile(owner, revision)).toMatchObject({
      status: 'published',
    })
  })

  test('the published CV is the site’s CV link, and Media shows where it is used', async () => {
    const { owner, bucket } = await createConfiguredOwner()
    expect(await owner.query(api.media.getPublishedCv, {})).toBeNull()
    bucket.putObject(`media/${CV.requestId}/cv-anders-planck.pdf`, {
      contentType: 'application/pdf',
      contentLength: CV.bytes,
    })
    const completion = await owner.action(api.media.completeUpload, CV)
    if (completion.kind !== 'recorded') {
      throw new Error(`Expected a recorded upload, got ${completion.kind}`)
    }
    const { revision } = await saveProfilePointingAt(owner, completion.mediaId)

    await publishProfile(owner, revision)

    expect(await owner.query(api.media.getPublishedCv, {})).toEqual({
      url: `${TEST_MEDIA_ORIGIN}/media/${CV.requestId}/cv-anders-planck.pdf`,
      fileName: 'cv-anders-planck.pdf',
    })
    const [entry] = (await owner.query(api.media.listMedia, {})).media
    expect(entry?.usages).toEqual([
      {
        collection: 'profile',
        key: 'main',
        field: 'cvMediaId',
        state: 'draft',
      },
      { collection: 'profile', key: 'main', field: 'cvMediaId', state: 'live' },
    ])
  })
})
