import { createFileRoute } from '@tanstack/react-router'

import { CmsOverviewPage } from '../../pages/cms-overview/cms-overview-page'

export const Route = createFileRoute('/cms/')({
  component: CmsOverviewPage,
})
