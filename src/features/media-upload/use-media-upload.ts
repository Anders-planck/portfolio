import { useRef, useState } from 'react'

import { toUploadableFile, type UploadableFile } from './to-uploadable-file'
import {
  putObjectToStorage,
  type UploadCommands,
  uploadMediaFile,
  type UploadProblem,
} from './upload-media-file'

/**
 * One upload at a time, as named states (TS-08). `interrupted`: the call
 * itself failed (connection lost, backend error), so the same upload can be
 * retried.
 */
export type UploadState =
  | { kind: 'idle' }
  | { kind: 'uploading'; fileName: string }
  | { kind: 'recorded'; fileName: string }
  | { kind: 'failed'; fileName: string; problem: UploadFailure }

/** Why the last upload failed: the server's answer or the call itself. */
export type UploadFailure = UploadProblem | 'interrupted' | 'unreadable-image'

interface PendingUpload {
  requestId: string
  file: UploadableFile
}

/** Failures a retry of the same request can fix. */
const RETRYABLE_FAILURES: readonly UploadFailure[] = [
  'interrupted',
  'not-uploaded',
  'not-stored',
  'mismatch',
]

export function canRetryUpload(failure: UploadFailure) {
  return RETRYABLE_FAILURES.includes(failure)
}

export function useMediaUpload(
  commands: Pick<UploadCommands, 'createUploadUrl' | 'completeUpload'>,
  acceptedMimes: readonly string[],
) {
  const [uploadState, setUploadState] = useState<UploadState>({
    kind: 'idle',
  })
  // The last request, kept for a retry with the same id (DATA-06).
  const pendingRef = useRef<PendingUpload | null>(null)

  const runUpload = async (pending: PendingUpload) => {
    pendingRef.current = pending
    const { fileName } = pending.file
    setUploadState({ kind: 'uploading', fileName })
    const outcome = await uploadMediaFile(pending.file, pending.requestId, {
      ...commands,
      putObject: putObjectToStorage,
    }).catch(() => ({
      kind: 'failed' as const,
      problem: 'interrupted' as const,
    }))
    if (outcome.kind === 'recorded') {
      pendingRef.current = null
      setUploadState({ kind: 'recorded', fileName })
      return
    }
    setUploadState({
      kind: 'failed',
      fileName,
      problem: outcome.problem,
    })
  }

  const startUpload = async (picked: File) => {
    setUploadState({ kind: 'uploading', fileName: picked.name })
    const file = await toUploadableFile(picked, acceptedMimes).catch(() => null)
    if (file === null) {
      setUploadState({
        kind: 'failed',
        fileName: picked.name,
        problem: 'unreadable-image',
      })
      return
    }
    await runUpload({ requestId: crypto.randomUUID(), file })
  }

  const retryUpload = async () => {
    if (pendingRef.current !== null) {
      await runUpload(pendingRef.current)
    }
  }

  return { uploadState, startUpload, retryUpload }
}
