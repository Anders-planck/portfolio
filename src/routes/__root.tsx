import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import { applyRedirectRules } from '../entities/redirect/apply-redirect-rules'
import { FIXED_REDIRECT_RULES } from '../entities/redirect/redirect-rule'
import { NotFoundPage } from '../pages/not-found/not-found-page'
import { DEFAULT_LOCALE } from '../shared/i18n/locale'
import { redirectFromDefaultLocalePrefix } from '../shared/i18n/redirect-from-default-locale-prefix'
import globalsCss from '../styles/globals.css?url'
import { loadSiteShell } from '../widgets/site-shell/load-site-shell'
import { SiteDocument } from '../widgets/site-shell/site-document'
import { toShellHead } from '../widgets/site-shell/to-shell-head'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: ({ location }) => {
    applyRedirectRules(location, FIXED_REDIRECT_RULES)
    redirectFromDefaultLocalePrefix(location)
  },
  // On the server, so the first paint already has the params (ADR 0010).
  loader: ({ context, location }) =>
    loadSiteShell(context.queryClient, location.pathname),
  head: ({ matches, loaderData }) => ({
    ...toShellHead(matches, loaderData?.locale ?? DEFAULT_LOCALE),
    // globals.css must be the first stylesheet: it declares the cascade-layer
    // order. The theme CSS imported by astryx-themes is linked after it.
    links: [{ rel: 'stylesheet', href: globalsCss }],
  }),
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
