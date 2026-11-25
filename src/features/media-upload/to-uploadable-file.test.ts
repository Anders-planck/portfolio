// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vitest'

import { toUploadableFile } from './to-uploadable-file'

const ACCEPTED = ['image/png', 'application/pdf']

afterEach(() => {
  vi.unstubAllGlobals()
})

test('a PDF goes as it is, without a pixel size', async () => {
  const pdf = new File(['%PDF-1.7'], 'cv.pdf', { type: 'application/pdf' })

  expect(await toUploadableFile(pdf, ACCEPTED)).toEqual({
    body: pdf,
    fileName: 'cv.pdf',
    mime: 'application/pdf',
    widthPx: null,
    heightPx: null,
  })
})

test('an image type the server does not accept is not re-encoded: the server refuses it', async () => {
  const decode = vi.fn()
  vi.stubGlobal('createImageBitmap', decode)
  const svg = new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' })

  expect(await toUploadableFile(svg, ACCEPTED)).toMatchObject({
    body: svg,
    mime: 'image/svg+xml',
  })
  expect(decode).not.toHaveBeenCalled()
})

test('an accepted image is decoded to be re-encoded; one that cannot be read fails', async () => {
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(() => Promise.reject(new Error('undecodable'))),
  )
  const png = new File(['not a png'], 'shot.png', { type: 'image/png' })

  await expect(toUploadableFile(png, ACCEPTED)).rejects.toThrow('undecodable')
})
