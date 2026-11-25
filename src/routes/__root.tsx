import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import { FIXED_REDIRECT_RULES } from '../entities/redirect/redirect-rule'
import { redirectToCanonicalAddress } from '../entities/redirect/redirect-to-canonical-address'
import { NotFoundPage } from '../pages/not-found/not-found-page'
import globalsCss from '../styles/globals.css?url'
import { loadSiteShell } from '../widgets/site-shell/load-site-shell'
import { SiteDocument } from '../widgets/site-shell/site-document'
import { toShellHead } from '../widgets/site-shell/to-shell-head'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: ({ location }) => {
    redirectToCanonicalAddress(location, FIXED_REDIRECT_RULES)
  },
  // On the server, so the first paint already has the params (ADR 0010).
  loader: ({ context, location }) =>
    loadSiteShell(context.queryClient, location.pathname),
  head: ({ matches, loaderData }) => {
    const shellHead = toShellHead({ matches, shell: loaderData })
    return {
      meta: shellHead.meta,
      // globals.css must be the first stylesheet: it declares the cascade-layer
      // order. The theme CSS imported by astryx-themes is linked after it.
      links: [{ rel: 'stylesheet', href: globalsCss }, ...shellHead.links],
    }
  },
  notFoundComponent: NotFoundPage,
  component: RootDocument,
})

function RootDocument() {
  return (
    <SiteDocument>
      <Outlet />
    </SiteDocument>
  )
}
