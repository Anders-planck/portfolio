import { createFileRoute, Outlet } from '@tanstack/react-router'

import { guardLocaleSegment } from '../../shared/i18n/guard-locale-segment'

// IT has no prefix; `/en`, `/fr`, `/de` serve the same pages in their locale.
export const Route = createFileRoute('/{-$locale}')({
  beforeLoad: ({ params }) => {
    guardLocaleSegment(params.locale)
  },
  component: Outlet,
})
