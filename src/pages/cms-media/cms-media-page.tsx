import { Banner } from '@astryxdesign/core/Banner'
import { Text } from '@astryxdesign/core/Text'
import { useQuery } from '@tanstack/react-query'
import { useAction, useMutation } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import { mediaLibraryQueryOptions } from '../../entities/media/media-library-query-options'
import { CMS_MEDIA_MESSAGES } from '../../shared/i18n/cms-media-messages'
import { MediaPage } from './media-page'

/**
 * `/cms/media`: the Media screen on the owner's Convex functions. `MediaPage`
 * renders what it is given; this reads the library and hands it the commands.
 */
export function CmsMediaPage() {
  const library = useQuery(mediaLibraryQueryOptions())
  const createUploadUrl = useAction(api.media.createUploadUrl)
  const completeUpload = useAction(api.media.completeUpload)
  const saveAlt = useMutation(api.media.saveAlt)

  if (library.isError) {
    return <Banner status="error" title={CMS_MEDIA_MESSAGES.loadFailed} />
  }
  if (library.isPending) {
    return (
      <Text type="body" role="status">
        {CMS_MEDIA_MESSAGES.loading}
      </Text>
    )
  }
  return (
    <MediaPage
      library={library.data}
      onCreateUploadUrl={createUploadUrl}
      onCompleteUpload={completeUpload}
      onSaveAlt={saveAlt}
    />
  )
}
