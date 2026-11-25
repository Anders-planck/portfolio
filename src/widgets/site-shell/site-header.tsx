import { Button } from '@astryxdesign/core/Button'
import { Stack } from '@astryxdesign/core/Stack'
import { TopNav, TopNavHeading, TopNavItem } from '@astryxdesign/core/TopNav'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'

import { publishedCvQueryOptions } from '../../entities/media/published-cv-query-options'
import { useMagnetic } from '../../features/motion/use-magnetic'
import {
  toPathnameInLocale,
  toUnprefixedPathname,
} from '../../shared/i18n/locale'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'
import { LanguageMenu } from './language-menu'
import { isInSection, SITE_SECTIONS } from './site-sections'

/**
 * The one header of every page (resolution 1): wordmark to Home, the
 * sections with `aria-current` on the one on screen, the language menu and
 * the CV button, which opens the published CV (none until one is published,
 * or while it cannot be read). Under 1024px the sections move into the menu
 * drawer.
 */
export function SiteHeader() {
  const locale = useLocale()
  const { site, navigation } = useMessages()
  const unprefixedPathname = useLocation({
    select: (location) => toUnprefixedPathname(location.pathname),
  })
  const cvButtonRef = useMagnetic<HTMLButtonElement>()
  const { data: cv } = useQuery(publishedCvQueryOptions())

  return (
    <TopNav
      label={navigation.label}
      heading={
        <TopNavHeading
          heading={site.wordmark}
          headingHref={toPathnameInLocale('/', locale)}
        />
      }
      startContent={SITE_SECTIONS.map((section) => (
        <TopNavItem
          key={section.path}
          label={navigation[section.labelKey]}
          href={toPathnameInLocale(section.path, locale)}
          isSelected={isInSection(unprefixedPathname, section.path)}
        />
      ))}
      endContent={
        <Stack direction="horizontal" gap={2} align="center">
          <LanguageMenu />
          {cv === undefined || cv === null ? null : (
            <Button
              ref={cvButtonRef}
              label={navigation.cv}
              href={cv.url}
              variant="primary"
              className="transition-transform duration-(--duration-medium) ease-(--ease-move)"
            />
          )}
        </Stack>
      }
    />
  )
}
