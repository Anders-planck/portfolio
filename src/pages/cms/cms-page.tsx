import { AppShell } from '@astryxdesign/core/AppShell'
import { Banner } from '@astryxdesign/core/Banner'
import { LinkProvider } from '@astryxdesign/core/Link'
import { Text } from '@astryxdesign/core/Text'
import { Outlet } from '@tanstack/react-router'

import { OwnerAuthProvider } from '../../features/owner-auth/owner-auth-provider'
import { useViewer } from '../../features/owner-auth/use-viewer'
import { AstryxLocaleProvider } from '../../shared/i18n/astryx-locale-provider'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import { RouterLink } from '../../shared/router/router-link'
import { CmsAccessScreen } from '../../widgets/cms-access/cms-access-screen'
import { CmsShell } from '../../widgets/cms-shell/cms-shell'

/**
 * `/cms`: signs the CMS in (ADR 0005) and lets only the owner past Accesso.
 * Every CMS screen renders inside it, without the site shell. The backend
 * checks the owner again on every call; this only decides what to show.
 */
export function CmsPage() {
  return (
    <LinkProvider component={RouterLink}>
      <AstryxLocaleProvider>
        <OwnerAuthProvider>
          <CmsGate />
        </OwnerAuthProvider>
      </AstryxLocaleProvider>
    </LinkProvider>
  )
}

function CmsGate() {
  const viewer = useViewer()
  switch (viewer.status) {
    case 'loading':
      return (
        <AppShell contentPadding={8} variant="surface">
          <Text type="body" role="status">
            {CMS_MESSAGES.shell.loading}
          </Text>
        </AppShell>
      )
    case 'error':
      return (
        <AppShell contentPadding={8} variant="surface">
          <Banner
            status="error"
            title={CMS_MESSAGES.shell.errorTitle}
            description={CMS_MESSAGES.shell.errorDescription}
          />
        </AppShell>
      )
    case 'signed-out':
      return <CmsAccessScreen isSignedInAsOther={false} />
    case 'not-owner':
      return <CmsAccessScreen isSignedInAsOther />
    case 'owner':
      return (
        <CmsShell>
          <Outlet />
        </CmsShell>
      )
  }
}
