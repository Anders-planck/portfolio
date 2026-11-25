import { createFileRoute, Outlet } from '@tanstack/react-router'

import { PageErrorPage } from '../../pages/page-error/page-error-page'
import { guardLocaleSegment } from '../../shared/i18n/guard-locale-segment'

// IT has no prefix; `/en`, `/fr`, `/de` serve the same pages in their locale.
export const Route = createFileRoute('/{-$locale}')({
  beforeLoad: ({ params }) => {
    guardLocaleSegment(params.locale)
  },
  component: Outlet,
  // A page whose data failed keeps the shell around its error.
  errorComponent: PageErrorPage,
})
