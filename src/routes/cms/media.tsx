import { createFileRoute } from '@tanstack/react-router'

import { CmsMediaPage } from '../../pages/cms-media/cms-media-page'

export const Route = createFileRoute('/cms/media')({
  component: CmsMediaPage,
})
