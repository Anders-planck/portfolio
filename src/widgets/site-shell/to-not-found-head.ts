import type { Locale } from '../../shared/i18n/locale'
import { toMessagesFromLocale } from '../../shared/i18n/to-messages-from-locale'

/**
 * The head of the 404 page: its title in the locale of the address, kept out of
 * search results. No canonical: the address is not a page of the site.
 */
export function toNotFoundHead(locale: Locale) {
  const messages = toMessagesFromLocale(locale)
  return {
    meta: [
      { title: `${messages.notFound.pageTitle} · ${messages.site.name}` },
      { name: 'robots', content: 'noindex' },
    ],
  }
}
