import { createFileRoute } from '@tanstack/react-router'

import { CmsProfilePage } from '../../pages/cms-profile/cms-profile-page'

export const Route = createFileRoute('/cms/profilo')({
  component: CmsProfilePage,
})
