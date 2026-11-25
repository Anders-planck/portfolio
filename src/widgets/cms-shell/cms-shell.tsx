import { AppShell } from '@astryxdesign/core/AppShell'
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav'
import { useLocation } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { SignOutButton } from '../../features/owner-auth/sign-out-button'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import { CMS_PATHNAME } from '../../shared/router/is-cms-pathname'

const NAVIGATION_COPY = CMS_MESSAGES.navigation

interface CmsScreen {
  href: string
  label: string
}

/** CMS screens of the Contenuti group, in menu order. */
const CONTENT_SCREENS: readonly CmsScreen[] = [
  { href: CMS_PATHNAME, label: NAVIGATION_COPY.overview },
  { href: `${CMS_PATHNAME}/profilo`, label: NAVIGATION_COPY.profile },
]

/** CMS screens of the Qualità group, in the mockups' order. */
const QUALITY_SCREENS: readonly CmsScreen[] = [
  { href: `${CMS_PATHNAME}/media`, label: NAVIGATION_COPY.media },
  { href: `${CMS_PATHNAME}/fonti`, label: NAVIGATION_COPY.sources },
]

/**
 * The frame of every CMS screen after sign-in: AppShell with a SideNav in
 * three groups, "Contenuti", "Sito" and "Qualità" (PLAN, CMS app). Groups
 * list only screens that exist.
 */
export function CmsShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <AppShell
      contentPadding={6}
      sideNav={
        <SideNav
          header={<SideNavHeading heading={CMS_MESSAGES.brand} />}
          footer={<SignOutButton />}
        >
          <SideNavSection title={NAVIGATION_COPY.content}>
            {CONTENT_SCREENS.map((screen) => (
              <SideNavItem
                key={screen.href}
                label={screen.label}
                href={screen.href}
                isSelected={pathname === screen.href}
              />
            ))}
          </SideNavSection>
          <SideNavSection title={NAVIGATION_COPY.site}>
            <SideNavItem label={NAVIGATION_COPY.viewSite} href="/" />
          </SideNavSection>
          <SideNavSection title={NAVIGATION_COPY.quality}>
            {QUALITY_SCREENS.map((screen) => (
              <SideNavItem
                key={screen.href}
                label={screen.label}
                href={screen.href}
                isSelected={pathname === screen.href}
              />
            ))}
          </SideNavSection>
        </SideNav>
      }
    >
      {children}
    </AppShell>
  )
}
