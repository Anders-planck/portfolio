import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Heading } from '@astryxdesign/core/Heading'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Stack } from '@astryxdesign/core/Stack'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Text } from '@astryxdesign/core/Text'

import { useProfileTranslation } from '../../entities/profile/use-profile-translation'
import { TranslationFallbackNotice } from '../../shared/i18n/translation-fallback-notice'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'

/**
 * Bare Home: the published Profile in the locale of the address, or in the
 * locale it falls back to, with a notice (user story 19). The immersive Home
 * arrives with ticket 08. The route loader awaits the queries, so the page
 * never renders pending. The shell gives `<main>`.
 */
export function HomePage() {
  const profile = useProfileTranslation(useLocale())
  const { home } = useMessages()

  if (profile.kind === 'missing') {
    return (
      <Layout height="auto">
        <LayoutContent padding={8}>
          <EmptyState title={home.emptyTitle} headingLevel={1} />
        </LayoutContent>
      </Layout>
    )
  }
  const { fields, content } = profile.content
  return (
    <Layout height="auto">
      <LayoutContent padding={8}>
        <Stack gap={6}>
          {profile.kind === 'fallback' && (
            <TranslationFallbackNotice shownLocale={profile.locale} />
          )}
          <Stack direction="horizontal" gap={2} align="center">
            {fields.isAvailable && (
              <StatusDot variant="success" label={content.availabilityLabel} />
            )}
            <Text type="label">{content.statusLabel}</Text>
          </Stack>
          <Heading level={1}>
            {content.titleLine1} {content.titleLine2}
          </Heading>
          <Text type="large" as="p">
            {content.subtitle}
          </Text>
          <Stack direction="horizontal" gap={4}>
            <Link href={`mailto:${fields.email}`}>{content.contactLabel}</Link>
            {fields.links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </LayoutContent>
    </Layout>
  )
}
