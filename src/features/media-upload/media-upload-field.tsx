import { Button } from '@astryxdesign/core/Button'
import { FileInput } from '@astryxdesign/core/FileInput'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import { CMS_MEDIA_MESSAGES } from '../../shared/i18n/cms-media-messages'
import type { UploadCommands } from './upload-media-file'
import {
  canRetryUpload,
  type UploadFailure,
  type UploadState,
  useMediaUpload,
} from './use-media-upload'

const UPLOAD_COPY = CMS_MEDIA_MESSAGES.upload

const MEGABYTES = new Intl.NumberFormat('it', {
  style: 'unit',
  unit: 'megabyte',
  maximumFractionDigits: 0,
})

/** How the server's limits read in the copy: `JPEG, PNG, PDF` and `10 MB`. */
interface LimitsCopy {
  types: string
  maxSize: string
}

function toLimitsCopy(acceptedMimes: readonly string[], maxBytes: number) {
  return {
    types: acceptedMimes
      .map((mime) => (mime.split('/')[1] ?? mime).toUpperCase())
      .join(', '),
    maxSize: MEGABYTES.format(maxBytes / (1024 * 1024)),
  }
}

export interface MediaUploadFieldProps {
  isDisabled: boolean
  /** The server's allowlist (`media.listMedia` limits); it decides again. */
  acceptedMimes: readonly string[]
  maxBytes: number
  onCreateUploadUrl: UploadCommands['createUploadUrl']
  onCompleteUpload: UploadCommands['completeUpload']
}

/**
 * "Carica" (mockup `cms-media`): pick a file and it uploads at once, with
 * its progress, its outcome and a retry of the same upload when one can help.
 */
export function MediaUploadField({
  isDisabled,
  acceptedMimes,
  maxBytes,
  onCreateUploadUrl,
  onCompleteUpload,
}: MediaUploadFieldProps) {
  const { uploadState, startUpload, retryUpload } = useMediaUpload(
    { createUploadUrl: onCreateUploadUrl, completeUpload: onCompleteUpload },
    acceptedMimes,
  )
  const limitsCopy = toLimitsCopy(acceptedMimes, maxBytes)

  return (
    <VStack gap={2}>
      <FileInput
        label={UPLOAD_COPY.label}
        description={UPLOAD_COPY.description(
          limitsCopy.types,
          limitsCopy.maxSize,
        )}
        accept={acceptedMimes.join(',')}
        value={null}
        isDisabled={isDisabled || uploadState.kind === 'uploading'}
        isLoading={uploadState.kind === 'uploading'}
        onChange={(files) => {
          const picked = Array.isArray(files) ? files[0] : files
          if (picked !== null && picked !== undefined) {
            void startUpload(picked)
          }
        }}
      />
      <HStack gap={2} align="center">
        <Text type="supporting" role="status">
          {toUploadStatusText(uploadState, limitsCopy)}
        </Text>
        {uploadState.kind === 'failed' &&
          canRetryUpload(uploadState.problem) && (
            <Button
              label={UPLOAD_COPY.retry}
              size="sm"
              clickAction={retryUpload}
            />
          )}
      </HStack>
    </VStack>
  )
}

function toUploadStatusText(uploadState: UploadState, limits: LimitsCopy) {
  switch (uploadState.kind) {
    case 'idle':
      return ''
    case 'uploading':
      return UPLOAD_COPY.uploading(uploadState.fileName)
    case 'recorded':
      return UPLOAD_COPY.recorded(uploadState.fileName)
    case 'failed':
      return toFailureText(uploadState.problem, limits)
  }
}

function toFailureText(failure: UploadFailure, limits: LimitsCopy) {
  switch (failure) {
    case 'type-not-allowed':
      return UPLOAD_COPY.typeNotAllowed(limits.types)
    case 'too-large':
      return UPLOAD_COPY.tooLarge(limits.maxSize)
    default:
      return UPLOAD_COPY.problems[failure]
  }
}
