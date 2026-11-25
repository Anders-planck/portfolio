/**
 * The media env of a local backend that uses the fake R2 server (Playwright).
 * None of these is a secret: the fake accepts any signature, and
 * `convex/model/env.ts` takes `R2_ENDPOINT` only on a local backend.
 */

export const FAKE_R2_BUCKET = 'portfolio-media-e2e'

export function toFakeR2Env(fakeOrigin: string): Record<string, string> {
  return {
    R2_ACCOUNT_ID: '00000000000000000000000000000000',
    R2_BUCKET: FAKE_R2_BUCKET,
    R2_ACCESS_KEY_ID: 'fake-access-key-id',
    R2_SECRET_ACCESS_KEY: 'fake-secret-access-key',
    R2_ENDPOINT: fakeOrigin,
    MEDIA_PUBLIC_ORIGIN: fakeOrigin,
  }
}
