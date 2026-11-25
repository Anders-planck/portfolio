import { useRouterState } from '@tanstack/react-router'

import { type Locale, toLocaleFromPathname } from './locale'

/**
 * The locale of the page on screen, read from its URL (its one source). The
 * resolved address, not the one being loaded: the shell switches language
 * together with the page, once the root loader has the next locale's words,
 * so nothing above the page ever waits for them.
 */
export function useLocale(): Locale {
  return useRouterState({
    select: (state) =>
      toLocaleFromPathname((state.resolvedLocation ?? state.location).pathname),
  })
}
