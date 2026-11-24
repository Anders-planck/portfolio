import { Theme } from '@astryxdesign/core/theme'
import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'

import { defaultThemeSlug, themes } from '../astryx-themes'
import { loadAppearance } from '../entities/appearance/load-appearance'
import { useAppearance } from '../entities/appearance/use-appearance'
import globalsCss from '../styles/globals.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  // On the server, so the first paint already has the params (ADR 0010).
  loader: ({ context }) => loadAppearance(context.queryClient),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Anders Planck' },
    ],
    // globals.css must be the first stylesheet: it declares the cascade-layer
    // order. The theme CSS imported by astryx-themes is linked after it.
    links: [{ rel: 'stylesheet', href: globalsCss }],
  }),
  component: RootDocument,
})

const SITE_THEME = themes[defaultThemeSlug]

function RootDocument() {
  const { appearance, css } = useAppearance()
  const { mode } = appearance.theme
  return (
    // The mode is on <html> from the server; <Theme> keeps it in sync.
    <html
      lang="it"
      data-astryx-theme={SITE_THEME.name}
      data-theme={mode === 'system' ? undefined : mode}
    >
      <head>
        <HeadContent />
        {/* After the built theme stylesheet, so the params win by order. */}
        <style data-appearance="" dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <Theme theme={SITE_THEME} mode={mode}>
          <Outlet />
        </Theme>
        <Scripts />
      </body>
    </html>
  )
}
