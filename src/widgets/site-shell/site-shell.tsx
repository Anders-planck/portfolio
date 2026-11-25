import { AppShell } from '@astryxdesign/core/AppShell'
import { LinkProvider } from '@astryxdesign/core/Link'
import type { ReactNode } from 'react'

import { Cursor } from '../../features/motion/cursor'
import { MotionProvider } from '../../features/motion/motion-provider'
import { AstryxLocaleProvider } from '../../shared/i18n/astryx-locale-provider'
import { RouterLink } from '../../shared/router/router-link'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

/**
 * The frame of every public page, the 404 included: header, the page in
 * `<main>`, footer and the cursor. Window scroll (ADR 0008), so the shell
 * grows with the page; the menu drawer takes over under 1024px (`lg`).
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <LinkProvider component={RouterLink}>
      <AstryxLocaleProvider>
        <MotionProvider>
          <AppShell
            height="auto"
            variant="surface"
            mobileNav={{ breakpoint: 'lg' }}
            topNav={<SiteHeader />}
          >
            {children}
          </AppShell>
          <SiteFooter />
          <Cursor />
        </MotionProvider>
      </AstryxLocaleProvider>
    </LinkProvider>
  )
}
