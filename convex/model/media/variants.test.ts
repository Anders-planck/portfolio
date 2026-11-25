import { expect, test } from 'vitest'

import { toImageSources } from './variants'

const ORIGINAL = 'https://media.example.com/media/abc/bussola-chat.png'
const SITE = 'https://example.com'

test('without a transform origin the original is the only source', () => {
  expect(
    toImageSources({ originalUrl: ORIGINAL, widthPx: 1440 }, null),
  ).toEqual({ src: ORIGINAL, srcSet: null })
})

test('with a transform origin every width up to the original is an AVIF/WebP variant', () => {
  const sources = toImageSources({ originalUrl: ORIGINAL, widthPx: 1440 }, SITE)

  const options = 'fit=scale-down,format=auto,metadata=none'
  expect(sources.src).toBe(
    `${SITE}/cdn-cgi/image/width=780,${options}/${ORIGINAL}`,
  )
  expect(sources.srcSet?.split(', ')).toEqual([
    `${SITE}/cdn-cgi/image/width=390,${options}/${ORIGINAL} 390w`,
    `${SITE}/cdn-cgi/image/width=780,${options}/${ORIGINAL} 780w`,
    `${SITE}/cdn-cgi/image/width=1170,${options}/${ORIGINAL} 1170w`,
    `${SITE}/cdn-cgi/image/width=1440,${options}/${ORIGINAL} 1440w`,
  ])
})

test('a small image is never enlarged', () => {
  const sources = toImageSources({ originalUrl: ORIGINAL, widthPx: 300 }, SITE)

  expect(sources.src).toContain('/width=300,')
  expect(sources.srcSet?.split(', ')).toHaveLength(1)
})
