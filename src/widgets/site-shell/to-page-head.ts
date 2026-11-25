import { toLocaleFromPathname } from '../../shared/i18n/locale'
import type { Messages } from '../../shared/i18n/messages'
import { toMessagesFromLocale } from '../../shared/i18n/to-messages-from-locale'
import { readSiteOrigin } from './read-site-origin'
import { toSeoHead } from './to-seo-head'

/**
 * The head of a page whose title and description are shell copy, in the
 * locale of its path. For a route's `head`: `toPageHead(match.pathname, …)`.
 */
export function toPageHead(
  pathname: string,
  pickCopy: (messages: Messages) => { title: string; description: string },
) {
  const messages = toMessagesFromLocale(toLocaleFromPathname(pathname))
  return toSeoHead({
    origin: readSiteOrigin(),
    pathname,
    siteName: messages.site.name,
    ...pickCopy(messages),
  })
}
