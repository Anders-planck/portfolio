import { Button } from '@astryxdesign/core/Button'
import { FileInput } from '@astryxdesign/core/FileInput'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import { CMS_MEDIA_MESSAGES } from '../../shared/i18n/cms-media-messages'
import type { UploadCommands } from './upload-media-file'
import { type UploadState, useMediaUpload } from './use-media-upload'

const UPLOAD_COPY = CMS_MEDIA_MESSAGES.upload

/** What the picker offers; the server holds the same list and decides. */
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,application/pdf'

export interface MediaUploadFieldProps {
  isDisabled: boolean
  onCreateUploadUrl: UploadCommands['createUploadUrl']
  onCompleteUpload: UploadCommands['completeUpload']
}

/**
 * "Carica" (mockup `cms-media`): pick a file and it uploads at once, with
 * its progress, its outcome and a retry of the same upload when one can help.
 */
export function MediaUploadField({
  isDisabled,
  onCreateUploadUrl,
  onCompleteUpload,
}: MediaUploadFieldProps) {
  const { uploadState, startUpload, retryUpload } = useMediaUpload({
    createUploadUrl: onCreateUploadUrl,
    completeUpload: onCompleteUpload,
  })

  return (
    <VStack gap={2}>
      <FileInput
        label={UPLOAD_COPY.label}
        description={UPLOAD_COPY.description}
        accept={ACCEPTED_TYPES}
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
          {toUploadStatusText(uploadState)}
        </Text>
        {uploadState.kind === 'failed' && uploadState.canRetry && (
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

function toUploadStatusText(uploadState: UploadState) {
  switch (uploadState.kind) {
    case 'idle':
      return ''
    case 'uploading':
      return UPLOAD_COPY.uploading(uploadState.fileName)
    case 'recorded':
      return UPLOAD_COPY.recorded(uploadState.fileName)
    case 'failed':
      return UPLOAD_COPY.problems[uploadState.problem]
  }
}
