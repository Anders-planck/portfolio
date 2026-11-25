import { AppShell } from '@astryxdesign/core/AppShell'
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav'
import { Text } from '@astryxdesign/core/Text'
import { useLocation } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { SignOutButton } from '../../features/owner-auth/sign-out-button'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const { navigation } = CMS_MESSAGES

/** CMS screens in the Contenuti group, in menu order. */
const CONTENT_SCREENS = [
  { href: '/cms', label: navigation.overview },
  { href: '/cms/profilo', label: navigation.profile },
] as const

/**
 * The frame of every CMS screen after sign-in: AppShell with a SideNav in
 * three groups, "Contenuti", "Sito" and "Qualità" (PLAN, CMS app). Groups
 * list only screens that exist; the others say they come later.
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
          <SideNavSection title={navigation.content}>
            {CONTENT_SCREENS.map((screen) => (
              <SideNavItem
                key={screen.href}
                label={screen.label}
                href={screen.href}
                isSelected={pathname === screen.href}
              />
            ))}
          </SideNavSection>
          <SideNavSection title={navigation.site}>
            <SideNavItem label={navigation.viewSite} href="/" />
          </SideNavSection>
          <SideNavSection title={navigation.quality}>
            <Text type="supporting" color="secondary">
              {navigation.comingSoon}
            </Text>
          </SideNavSection>
        </SideNav>
      }
    >
      {children}
    </AppShell>
  )
}
