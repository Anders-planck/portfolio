// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { Id } from '../../../convex/_generated/dataModel'
import { RefusalBoundary } from '../../shared/convex/refusal-boundary.fixture'
import {
  MediaUploadField,
  type MediaUploadFieldProps,
} from './media-upload-field'

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

type Commands = Pick<
  MediaUploadFieldProps,
  'onCreateUploadUrl' | 'onCompleteUpload'
>

const READY_URL: Commands['onCreateUploadUrl'] = () =>
  Promise.resolve({ kind: 'ready', uploadUrl: 'https://r2/put' })
const RECORDED: Commands['onCompleteUpload'] = () =>
  Promise.resolve({ kind: 'recorded', mediaId: MEDIA_ID })

/** The field inside a boundary that shows a backend refusal it catches. */
function renderField({
  onCreateUploadUrl = READY_URL,
  onCompleteUpload = RECORDED,
}: Partial<Commands> = {}) {
  render(
    <RefusalBoundary>
      <MediaUploadField
        isDisabled={false}
        acceptedMimes={['image/png', 'application/pdf']}
        maxBytes={10 * 1024 * 1024}
        onCreateUploadUrl={onCreateUploadUrl}
        onCompleteUpload={onCompleteUpload}
      />
    </RefusalBoundary>,
  )
}

function pickFile(file: File) {
  const input = document.querySelector('input[type="file"]')
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('No file input')
  }
  fireEvent.change(input, { target: { files: [file] } })
}

function pickPdf() {
  pickFile(new File(['%PDF-1.7'], 'cv.pdf', { type: 'application/pdf' }))
}

test('picking a file uploads it at once and says so', async () => {
  renderField()

  pickPdf()

  expect(await screen.findByText('cv.pdf caricato.')).toBeDefined()
})

test('a retry repeats the same upload request', async () => {
  const onCreateUploadUrl = vi.fn(READY_URL)
  const onCompleteUpload = vi
    .fn<Commands['onCompleteUpload']>()
    .mockResolvedValueOnce({ kind: 'refused', reason: 'not-uploaded' })
    .mockResolvedValueOnce({ kind: 'recorded', mediaId: MEDIA_ID })
  renderField({ onCreateUploadUrl, onCompleteUpload })

  pickPdf()
  fireEvent.click(await screen.findByRole('button', { name: 'Riprova' }))

  expect(await screen.findByText('cv.pdf caricato.')).toBeDefined()
  const [first, second] = onCreateUploadUrl.mock.calls.map((call) => call[0])
  expect(second).toEqual(first)
})

test('a refusal a retry cannot fix offers no retry, and names the limit', async () => {
  renderField({
    onCreateUploadUrl: () =>
      Promise.resolve({ kind: 'refused', reason: 'too-large' }),
  })

  pickPdf()

  expect(
    await screen.findByText('File troppo grande: il limite è 10 MB.'),
  ).toBeDefined()
  expect(screen.queryByRole('button', { name: 'Riprova' })).toBeNull()
})

test('an image the browser cannot read is never uploaded', async () => {
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(() => Promise.reject(new Error('undecodable'))),
  )
  const onCreateUploadUrl = vi.fn(READY_URL)
  renderField({ onCreateUploadUrl })

  pickFile(new File(['not a png'], 'shot.png', { type: 'image/png' }))

  expect(
    await screen.findByText(
      'Il browser non riesce a leggere questa immagine: esportala di nuovo e riprova.',
    ),
  ).toBeDefined()
  expect(onCreateUploadUrl).not.toHaveBeenCalled()
  expect(screen.queryByRole('button', { name: 'Riprova' })).toBeNull()
})

test('a lost connection says the upload was interrupted and offers a retry', async () => {
  renderField({
    onCreateUploadUrl: () => Promise.reject(new Error('Connection lost')),
  })

  pickPdf()

  expect(
    await screen.findByText('Caricamento interrotto. Riprova.'),
  ).toBeDefined()
  expect(screen.getByRole('button', { name: 'Riprova' })).toBeDefined()
})

test('a backend refusal goes to the error boundary, not to a retry', async () => {
  renderField({
    onCreateUploadUrl: () =>
      Promise.reject(new ConvexError({ kind: 'signed-out' })),
  })

  pickPdf()

  expect(await screen.findByText('refused: signed-out')).toBeDefined()
  expect(screen.queryByText('Caricamento interrotto. Riprova.')).toBeNull()
})
