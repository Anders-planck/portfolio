import { vi } from 'vitest'

/**
 * A stand-in R2 for convex-test: the media env of a configured backend and
 * an in-memory bucket behind a stubbed `fetch`, so the S3 calls the backend
 * signs (HEAD, copy, DELETE) answer without a network.
 */

export const TEST_R2_ENDPOINT =
  'https://0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com'
export const TEST_R2_BUCKET = 'portfolio-media'
export const TEST_MEDIA_ORIGIN = 'https://media.example.com'

export function stubMediaStorageEnv() {
  vi.stubEnv('R2_ACCOUNT_ID', '0123456789abcdef0123456789abcdef')
  vi.stubEnv('R2_BUCKET', TEST_R2_BUCKET)
  vi.stubEnv('R2_ACCESS_KEY_ID', 'test-access-key-id')
  vi.stubEnv('R2_SECRET_ACCESS_KEY', 'test-secret-access-key')
  vi.stubEnv('MEDIA_PUBLIC_ORIGIN', TEST_MEDIA_ORIGIN)
}

interface StoredTestObject {
  contentType: string
  contentLength: number
}

/** The objects of the fake bucket and every request R2 received. */
export function stubR2Bucket() {
  const objects = new Map<string, StoredTestObject>()
  const requests: { method: string; objectKey: string }[] = []
  const prefix = `${TEST_R2_ENDPOINT}/${TEST_R2_BUCKET}/`

  const fetchMock = vi.fn((input: Request) => {
    const objectKey = input.url.startsWith(prefix)
      ? decodeURIComponent(input.url.slice(prefix.length))
      : null
    if (objectKey === null) {
      return Promise.reject(new TypeError('fetch failed'))
    }
    requests.push({ method: input.method, objectKey })
    const copySource = input.headers.get('x-amz-copy-source')
    if (input.method === 'PUT' && copySource !== null) {
      const source = objects.get(
        decodeURIComponent(copySource).replace(`/${TEST_R2_BUCKET}/`, ''),
      )
      if (source === undefined) {
        return Promise.resolve(new Response(null, { status: 404 }))
      }
      objects.set(objectKey, source)
      return Promise.resolve(new Response(null, { status: 200 }))
    }
    const stored = objects.get(objectKey)
    if (input.method === 'DELETE') {
      objects.delete(objectKey)
      return Promise.resolve(new Response(null, { status: 204 }))
    }
    if (stored === undefined) {
      return Promise.resolve(new Response(null, { status: 404 }))
    }
    return Promise.resolve(
      new Response(null, {
        status: 200,
        headers: {
          'Content-Type': stored.contentType,
          'Content-Length': String(stored.contentLength),
        },
      }),
    )
  })
  vi.stubGlobal('fetch', fetchMock)

  return {
    requests,
    hasObject: (objectKey: string) => objects.has(objectKey),
    /** What the browser's presigned PUT would leave in the bucket. */
    putObject: (objectKey: string, object: StoredTestObject) => {
      objects.set(objectKey, object)
    },
  }
}
