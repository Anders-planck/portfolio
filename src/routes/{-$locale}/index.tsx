import { createFileRoute } from '@tanstack/react-router'

import { loadProfile } from '../../entities/profile/load-profile'
import { HomePage } from '../../pages/home/home-page'
import { toLocaleFromPathname } from '../../shared/i18n/locale'
import { toPageHead } from '../../widgets/site-shell/to-page-head'

export const Route = createFileRoute('/{-$locale}/')({
  // Awaiting in the loader renders the published profile on the server.
  loader: ({ context, location }) =>
    loadProfile(context.queryClient, toLocaleFromPathname(location.pathname)),
  head: ({ match }) =>
    toPageHead(match.pathname, ({ site }) => ({
      title: site.name,
      description: site.description,
    })),
  component: HomePage,
})
