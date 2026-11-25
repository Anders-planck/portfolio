import { Banner } from '@astryxdesign/core/Banner'
import { Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout'
import { Heading, Text } from '@astryxdesign/core/Text'
import { useState } from 'react'

import type {
  MediaEntry,
  MediaLibrary,
} from '../../entities/media/media-library-query-options'
import {
  MediaUploadField,
  type MediaUploadFieldProps,
} from '../../features/media-upload/media-upload-field'
import { CMS_MEDIA_MESSAGES } from '../../shared/i18n/cms-media-messages'
import type { Locale } from '../../shared/i18n/locale'
import { MediaAltDialog } from './media-alt-dialog'
import { MediaTable } from './media-table'

export interface MediaPageProps {
  library: MediaLibrary
  onCreateUploadUrl: MediaUploadFieldProps['onCreateUploadUrl']
  onCompleteUpload: MediaUploadFieldProps['onCompleteUpload']
  onSaveAlt: (edit: {
    mediaId: MediaEntry['mediaId']
    locale: Locale
    alt: string
  }) => Promise<{ savedAt: number }>
}

/**
 * CMS Media (mockup `cms-media`): upload, every media with where it is used
 * and how its alt text stands, and the alt editor of one image. It renders
 * data it is given; `cms-media-page.tsx` wires the Convex functions.
 */
export function MediaPage({
  library,
  onCreateUploadUrl,
  onCompleteUpload,
  onSaveAlt,
}: MediaPageProps) {
  const [altMediaId, setAltMediaId] = useState<MediaEntry['mediaId'] | null>(
    null,
  )
  // Read from the live library, so the dialog shows alt saved since it opened.
  const altEntry =
    library.media.find((entry) => entry.mediaId === altMediaId) ?? null

  return (
    <Layout
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <VStack gap={1}>
              <Heading level={1}>{CMS_MEDIA_MESSAGES.title}</Heading>
              <Text color="secondary">{CMS_MEDIA_MESSAGES.intro}</Text>
            </VStack>
            {!library.isStorageConfigured && (
              <Banner
                status="warning"
                title={CMS_MEDIA_MESSAGES.notConfiguredTitle}
                description={CMS_MEDIA_MESSAGES.notConfiguredDescription}
              />
            )}
            {library.isStorageConfigured && !library.hasImageVariants && (
              <Banner status="info" title={CMS_MEDIA_MESSAGES.originalsOnly} />
            )}
            <MediaUploadField
              isDisabled={!library.isStorageConfigured}
              acceptedMimes={library.limits.acceptedMimes}
              maxBytes={library.limits.maxBytes}
              onCreateUploadUrl={onCreateUploadUrl}
              onCompleteUpload={onCompleteUpload}
            />
            <MediaTable entries={library.media} onOpenAlt={setAltMediaId} />
          </VStack>
          <MediaAltDialog
            entry={altEntry}
            maxAltLength={library.limits.maxAltLength}
            onSaveAlt={async (edit) => {
              if (altEntry !== null) {
                await onSaveAlt({ mediaId: altEntry.mediaId, ...edit })
              }
            }}
            onClose={() => {
              setAltMediaId(null)
            }}
          />
        </LayoutContent>
      }
    />
  )
}
