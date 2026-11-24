import { Theme } from '@astryxdesign/core/theme'
import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { defaultThemeSlug, themes } from '../astryx-themes'
import globalsCss from '../styles/globals.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
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
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <head>
        <HeadContent />
      </head>
      <body>
        <Theme theme={themes[defaultThemeSlug]}>{children}</Theme>
        <Scripts />
      </body>
    </html>
  )
}
