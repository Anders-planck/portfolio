import { createFileRoute } from '@tanstack/react-router'

import { CmsPage } from '../../pages/cms/cms-page'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

// Client only: the owner's session lives in localStorage (ADR 0005), and the
// CMS is never indexed.
export const Route = createFileRoute('/cms')({
  ssr: false,
  head: () => ({
    meta: [
      { title: CMS_MESSAGES.documentTitle },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: CmsPage,
})
