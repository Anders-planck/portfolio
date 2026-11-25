import { LayoutFooter } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Stack } from '@astryxdesign/core/Stack'

import { useReveal } from '../../features/motion/use-reveal'
import { toPathnameInLocale } from '../../shared/i18n/locale'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'
import { CV_PATH, SITE_SECTIONS } from './site-sections'

/**
 * The footer of every page: the wordmark home and the same sections as the
 * header. Contacts and social links come with the published Profile.
 */
export function SiteFooter() {
  const locale = useLocale()
  const { site, navigation } = useMessages()
  const revealRef = useReveal<HTMLDivElement>()

  return (
    <LayoutFooter role="contentinfo" label={navigation.footerLabel} hasDivider>
      <Stack
        ref={revealRef}
        direction="horizontal"
        gap={6}
        align="center"
        justify="between"
        wrap="wrap"
      >
        <Link href={toPathnameInLocale('/', locale)} color="primary">
          {site.wordmark}
        </Link>
        <Stack direction="horizontal" gap={4} wrap="wrap">
          {SITE_SECTIONS.map((section) => (
            <Link
              key={section.path}
              href={toPathnameInLocale(section.path, locale)}
              color="secondary"
            >
              {navigation[section.labelKey]}
            </Link>
          ))}
          <Link href={CV_PATH} color="secondary">
            {navigation.cv}
          </Link>
        </Stack>
      </Stack>
    </LayoutFooter>
  )
}
