import { useLocation } from '@tanstack/react-router'

import { type Locale, toLocaleFromPathname } from './locale'

/** The locale of the page on screen, read from its URL (its one source). */
export function useLocale(): Locale {
  return useLocation({
    select: (location) => toLocaleFromPathname(location.pathname),
  })
}
