import { expect, test } from 'vitest'

import { toSiteOrigin } from './site-origin'

test('on the configured host the URLs are its own and the page is indexed', () => {
  expect(
    toSiteOrigin({
      configuredOrigin: 'https://example.com',
      requestOrigin: 'https://example.com',
    }),
  ).toEqual({ canonicalOrigin: 'https://example.com', isIndexable: true })
})

test('a preview points its URLs at the configured host and is not indexed', () => {
  expect(
    toSiteOrigin({
      configuredOrigin: 'https://example.com',
      requestOrigin: 'https://portfolio.preview.workers.dev',
    }),
  ).toEqual({ canonicalOrigin: 'https://example.com', isIndexable: false })
})

test('without a configured origin the request origin is used and nothing is indexed', () => {
  expect(
    toSiteOrigin({
      configuredOrigin: undefined,
      requestOrigin: 'http://localhost:4173',
    }),
  ).toEqual({ canonicalOrigin: 'http://localhost:4173', isIndexable: false })
})
