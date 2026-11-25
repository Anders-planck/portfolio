import { createFileRoute } from '@tanstack/react-router'

import { CmsSourcesPage } from '../../pages/cms-sources/cms-sources-page'

export const Route = createFileRoute('/cms/fonti')({
  component: CmsSourcesPage,
})
