import { expect, test } from 'vitest'

import {
  checkUploadRequest,
  MAX_IMAGE_SIDE_PX,
  MAX_MEDIA_BYTES,
  toIncomingObjectKeyFromUpload,
  toObjectKeyFromUpload,
  type UploadRequest,
} from './files'

const REQUEST_ID = '0f8b3c52-6f0e-4a7e-9a59-1f9e8d6b2c11'

const SCREENSHOT: UploadRequest = {
  requestId: REQUEST_ID,
  fileName: 'bussola-chat.png',
  mime: 'image/png',
  bytes: 240_000,
  widthPx: 1440,
  heightPx: 900,
}

const CV: UploadRequest = {
  requestId: REQUEST_ID,
  fileName: 'cv-anders-planck.pdf',
  mime: 'application/pdf',
  bytes: 90_000,
  widthPx: null,
  heightPx: null,
}

test('an image with its pixel size and a PDF without one are accepted', () => {
  expect(checkUploadRequest(SCREENSHOT)).toEqual({
    kind: 'accepted',
    upload: SCREENSHOT,
  })
  expect(checkUploadRequest(CV)).toMatchObject({ kind: 'accepted' })
})

test('types outside the allowlist are refused, SVG included', () => {
  for (const mime of ['image/svg+xml', 'image/gif', 'text/html']) {
    expect(checkUploadRequest({ ...SCREENSHOT, mime })).toEqual({
      kind: 'refused',
      reason: 'type-not-allowed',
    })
  }
})

test('an empty file and one over the size limit are refused', () => {
  expect(checkUploadRequest({ ...SCREENSHOT, bytes: 0 })).toEqual({
    kind: 'refused',
    reason: 'empty',
  })
  expect(
    checkUploadRequest({ ...SCREENSHOT, bytes: MAX_MEDIA_BYTES + 1 }),
  ).toEqual({ kind: 'refused', reason: 'too-large' })
})

test('an image without a whole pixel size within bounds is refused', () => {
  const sizes = [
    { widthPx: null, heightPx: 900 },
    { widthPx: 0, heightPx: 900 },
    { widthPx: 1440.5, heightPx: 900 },
    { widthPx: MAX_IMAGE_SIDE_PX + 1, heightPx: 900 },
  ]
  for (const size of sizes) {
    expect(checkUploadRequest({ ...SCREENSHOT, ...size })).toEqual({
      kind: 'refused',
      reason: 'bad-size',
    })
  }
  expect(checkUploadRequest({ ...CV, widthPx: 10, heightPx: 10 })).toEqual({
    kind: 'refused',
    reason: 'bad-size',
  })
})

test('a blank name is refused', () => {
  expect(checkUploadRequest({ ...SCREENSHOT, fileName: '  ' })).toEqual({
    kind: 'refused',
    reason: 'bad-name',
  })
})

test('a request id that is not a UUID throws', () => {
  expect(() =>
    checkUploadRequest({ ...SCREENSHOT, requestId: '../other' }),
  ).toThrow(/UUID/)
})

test('the object key keeps one folder per request and a URL-safe name', () => {
  expect(
    toObjectKeyFromUpload({
      requestId: REQUEST_ID,
      fileName: ' Pannello Comanda (è).PNG ',
    }),
  ).toBe(`media/${REQUEST_ID}/pannello-comanda-e-.png`)
  expect(
    toObjectKeyFromUpload({ requestId: REQUEST_ID, fileName: '***' }),
  ).toBe(`media/${REQUEST_ID}/file`)
})

test('a name of dots never becomes a `.` or `..` path segment', () => {
  for (const fileName of ['.', '..', '...', '.hidden.']) {
    const objectKey = toObjectKeyFromUpload({ requestId: REQUEST_ID, fileName })
    const segments = objectKey.split('/')
    expect(segments).not.toContain('.')
    expect(segments).not.toContain('..')
    expect(segments.at(-1)?.startsWith('.')).toBe(false)
  }
})

test('the browser uploads under incoming, beside the media key it will get', () => {
  const upload = { requestId: REQUEST_ID, fileName: 'shot.png' }

  expect(toIncomingObjectKeyFromUpload(upload)).toBe(
    `incoming/${REQUEST_ID}/shot.png`,
  )
  expect(toObjectKeyFromUpload(upload)).toBe(`media/${REQUEST_ID}/shot.png`)
})
