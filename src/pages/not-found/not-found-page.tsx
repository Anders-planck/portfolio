import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import { toPathnameInLocale } from '../../shared/i18n/locale'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'
import { WORK_PATH } from '../../widgets/site-shell/site-sections'

/**
 * The 404 page, in the locale of the address: back home or to the work, so
 * a broken link never loses the reader (user story 22).
 */
export function NotFoundPage() {
  const locale = useLocale()
  const { notFound } = useMessages()

  return (
    <Layout height="auto">
      <LayoutContent padding={8}>
        <Stack gap={6} align="start">
          <Text type="label" color="secondary">
            {notFound.eyebrow}
          </Text>
          <Heading level={1}>{notFound.title}</Heading>
          <Text type="large" as="p">
            {notFound.body}
          </Text>
          <Stack direction="horizontal" gap={3} wrap="wrap">
            <Button
              label={notFound.homeLink}
              href={toPathnameInLocale('/', locale)}
              variant="primary"
            />
            <Button
              label={notFound.workLink}
              href={toPathnameInLocale(WORK_PATH, locale)}
            />
          </Stack>
        </Stack>
      </LayoutContent>
    </Layout>
  )
}
