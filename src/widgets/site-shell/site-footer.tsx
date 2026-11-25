import { LayoutFooter } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Stack } from '@astryxdesign/core/Stack'
import { useQuery } from '@tanstack/react-query'

import { publishedCvQueryOptions } from '../../entities/media/published-cv-query-options'
import {
  profileQueryOptions,
  toPublishedProfile,
} from '../../entities/profile/profile-query-options'
import { useReveal } from '../../features/motion/use-reveal'
import { toPathnameInLocale } from '../../shared/i18n/locale'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'
import { SITE_SECTIONS } from './site-sections'

/**
 * The footer of every page: the wordmark home, the same sections as the
 * header, the published CV, and the contacts and social links of the published Profile (none
 * before it is published, or while it cannot be read). The shell loader
 * fills the Profile query.
 */
export function SiteFooter() {
  const locale = useLocale()
  const { site, navigation } = useMessages()
  const revealRef = useReveal<HTMLDivElement>()
  const profile = toPublishedProfile(useQuery(profileQueryOptions(locale)).data)
  const { data: cv } = useQuery(publishedCvQueryOptions())

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
          {cv === undefined || cv === null ? null : (
            <Link href={cv.url} color="secondary">
              {navigation.cv}
            </Link>
          )}
        </Stack>
        {profile === null ? null : (
          <Stack direction="horizontal" gap={4} wrap="wrap">
            <Link href={`mailto:${profile.fields.email}`} color="secondary">
              {profile.fields.email}
            </Link>
            {profile.fields.links.map((link) => (
              <Link key={link.href} href={link.href} color="secondary">
                {link.label}
              </Link>
            ))}
          </Stack>
        )}
      </Stack>
    </LayoutFooter>
  )
}
