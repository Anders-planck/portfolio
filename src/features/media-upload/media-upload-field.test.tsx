// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { Id } from '../../../convex/_generated/dataModel'
import { MediaUploadField } from './media-upload-field'

const MEDIA_ID = 'media-one' as Id<'media'>

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response(null, { status: 200 }))),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderField(
  onCompleteUpload: () => Promise<
    | { kind: 'recorded'; mediaId: Id<'media'> }
    | { kind: 'refused'; reason: 'not-uploaded' }
  >,
) {
  const onCreateUploadUrl = vi.fn(() =>
    Promise.resolve({ kind: 'ready' as const, uploadUrl: 'https://r2/put' }),
  )
  render(
    <MediaUploadField
      isDisabled={false}
      onCreateUploadUrl={onCreateUploadUrl}
      onCompleteUpload={onCompleteUpload}
    />,
  )
  return onCreateUploadUrl
}

function pickPdf() {
  const input = document.querySelector('input[type="file"]')
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('No file input')
  }
  const file = new File(['%PDF-1.7'], 'cv.pdf', { type: 'application/pdf' })
  fireEvent.change(input, { target: { files: [file] } })
}

test('picking a file uploads it at once and says so', async () => {
  renderField(() => Promise.resolve({ kind: 'recorded', mediaId: MEDIA_ID }))

  pickPdf()

  expect(await screen.findByText('cv.pdf caricato.')).toBeDefined()
})

test('a retry repeats the same upload request', async () => {
  const onCompleteUpload = vi
    .fn()
    .mockResolvedValueOnce({ kind: 'refused', reason: 'not-uploaded' })
    .mockResolvedValueOnce({ kind: 'recorded', mediaId: MEDIA_ID })
  const onCreateUploadUrl = renderField(onCompleteUpload)

  pickPdf()
  fireEvent.click(await screen.findByRole('button', { name: 'Riprova' }))

  expect(await screen.findByText('cv.pdf caricato.')).toBeDefined()
  const [first, second] = onCreateUploadUrl.mock.calls.map(
    (call: unknown[]) => call[0],
  )
  expect(second).toEqual(first)
})
