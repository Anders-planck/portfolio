import { expect, test, vi } from 'vitest'

import type { Id } from '../../../convex/_generated/dataModel'
import type { UploadableFile } from './to-uploadable-file'
import { type UploadCommands, uploadMediaFile } from './upload-media-file'

const REQUEST_ID = '0f8b3c52-6f0e-4a7e-9a59-1f9e8d6b2c11'
const MEDIA_ID = 'media-one' as Id<'media'>
const PDF: UploadableFile = {
  body: new Blob(['%PDF-1.7'], { type: 'application/pdf' }),
  fileName: 'cv.pdf',
  mime: 'application/pdf',
  widthPx: null,
  heightPx: null,
}

function toCommands(overrides: Partial<UploadCommands> = {}): UploadCommands {
  return {
    createUploadUrl: vi.fn(() =>
      Promise.resolve({ kind: 'ready' as const, uploadUrl: 'https://r2/put' }),
    ),
    putObject: vi.fn(() => Promise.resolve(true)),
    completeUpload: vi.fn(() =>
      Promise.resolve({ kind: 'recorded' as const, mediaId: MEDIA_ID }),
    ),
    ...overrides,
  }
}

test('a file is signed, put to R2 with its type and recorded', async () => {
  const commands = toCommands()

  expect(await uploadMediaFile(PDF, REQUEST_ID, commands)).toEqual({
    kind: 'recorded',
    mediaId: MEDIA_ID,
  })
  const request = {
    requestId: REQUEST_ID,
    fileName: 'cv.pdf',
    mime: 'application/pdf',
    bytes: PDF.body.size,
    widthPx: null,
    heightPx: null,
  }
  expect(commands.createUploadUrl).toHaveBeenCalledWith(request)
  expect(commands.putObject).toHaveBeenCalledWith(
    'https://r2/put',
    PDF.body,
    'application/pdf',
  )
  expect(commands.completeUpload).toHaveBeenCalledWith(request)
})

test('a refused request is never put to R2', async () => {
  const commands = toCommands({
    createUploadUrl: () =>
      Promise.resolve({ kind: 'refused', reason: 'too-large' }),
  })

  expect(await uploadMediaFile(PDF, REQUEST_ID, commands)).toEqual({
    kind: 'failed',
    problem: 'too-large',
  })
  expect(commands.putObject).not.toHaveBeenCalled()
})

test('a PUT R2 refuses is not completed', async () => {
  const commands = toCommands({ putObject: () => Promise.resolve(false) })

  expect(await uploadMediaFile(PDF, REQUEST_ID, commands)).toEqual({
    kind: 'failed',
    problem: 'not-stored',
  })
  expect(commands.completeUpload).not.toHaveBeenCalled()
})

test('storage that is not configured is a failure of its own', async () => {
  const commands = toCommands({
    createUploadUrl: () => Promise.resolve({ kind: 'not-configured' }),
  })

  expect(await uploadMediaFile(PDF, REQUEST_ID, commands)).toEqual({
    kind: 'failed',
    problem: 'not-configured',
  })
})
