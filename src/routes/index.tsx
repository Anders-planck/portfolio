import { Heading } from '@astryxdesign/core/Heading'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Stack } from '@astryxdesign/core/Stack'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Text } from '@astryxdesign/core/Text'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'

// Bare Home: the published Profile in the default locale. Locale routing
// (`/en`, `/fr`, `/de`) and the immersive Home arrive with later tickets.
const profileQuery = convexQuery(api.content.store.getPublished, {
  collection: 'profile',
  key: 'main',
  locale: 'it',
})

export const Route = createFileRoute('/')({
  // Awaiting in the loader renders the published profile on the server.
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: HomePage,
})

function HomePage() {
  const { data: profile } = useSuspenseQuery(profileQuery)

  return (
    <Layout
      content={
        <LayoutContent role="main" padding={8}>
          {profile?.content ? (
            <Stack gap={6}>
              <Stack direction="horizontal" gap={2} align="center">
                {profile.fields.showAvailability && (
                  <StatusDot variant="success" label="Disponibile" />
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
                <Link href={`mailto:${profile.fields.email}`}>Scrivimi</Link>
                {profile.fields.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Stack>
          ) : (
            <Heading level={1}>Anders Planck</Heading>
          )}
        </LayoutContent>
      }
    />
  )
}
