import { Heading } from '@astryxdesign/core/Heading'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Stack } from '@astryxdesign/core/Stack'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Text } from '@astryxdesign/core/Text'
import { useSuspenseQuery } from '@tanstack/react-query'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'

/**
 * Bare Home: the published Profile in the default locale. Locale routing
 * (`/en`, `/fr`, `/de`) and the immersive Home arrive with later tickets.
 */
export const homeProfileQueryOptions = convexQueryOptions(
  api.content.getPublished,
  { collection: 'profile', key: 'main', locale: 'it' },
)

export function HomePage() {
  const { data: profile } = useSuspenseQuery(homeProfileQueryOptions)

  return (
    <Layout
      content={
        <LayoutContent role="main" padding={8}>
          {/* Nothing published yet in this locale: the page stays empty. */}
          {profile?.content == null ? null : (
            <Stack gap={6}>
              <Stack direction="horizontal" gap={2} align="center">
                {profile.fields.isAvailable && (
                  <StatusDot
                    variant="success"
                    label={profile.content.availabilityLabel}
                  />
                )}
                <Text type="label">{profile.content.statusLabel}</Text>
              </Stack>
              <Heading level={1}>
                {profile.content.titleLine1} {profile.content.titleLine2}
              </Heading>
              <Text type="large" as="p">
                {profile.content.subtitle}
              </Text>
              <Stack direction="horizontal" gap={4}>
                <Link href={`mailto:${profile.fields.email}`}>
                  {profile.content.contactLabel}
                </Link>
                {profile.fields.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Stack>
          )}
        </LayoutContent>
      }
    />
  )
}
