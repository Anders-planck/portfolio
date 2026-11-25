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
  | {
      kind: 'failed'
      fileName: string
      problem: UploadProblem | 'interrupted' | 'unreadable-image'
      canRetry: boolean
    }

interface PendingUpload {
  requestId: string
  file: UploadableFile
}

/** Problems a retry of the same request can fix. */
const RETRYABLE_PROBLEMS: readonly UploadProblem[] = [
  'not-uploaded',
  'not-stored',
  'mismatch',
]

export function useMediaUpload(
  commands: Pick<UploadCommands, 'createUploadUrl' | 'completeUpload'>,
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
      canRetry:
        outcome.problem === 'interrupted' ||
        RETRYABLE_PROBLEMS.includes(outcome.problem),
    })
  }

  const startUpload = async (picked: File) => {
    setUploadState({ kind: 'uploading', fileName: picked.name })
    const file = await toUploadableFile(picked).catch(() => null)
    if (file === null) {
      setUploadState({
        kind: 'failed',
        fileName: picked.name,
        problem: 'unreadable-image',
        canRetry: false,
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
