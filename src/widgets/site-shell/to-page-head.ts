import { toLocaleFromPathname } from '../../shared/i18n/locale'
import type { Messages } from '../../shared/i18n/messages'
import { toMessagesFromLocale } from '../../shared/i18n/to-messages-from-locale'

/**
 * What a page says about itself, for its route's `head`: title,
 * description and their Open Graph copies, in the locale of its path. The
 * address part (canonical, hreflang, `og:url`) comes from the root
 * (`toShellHead`). Usage: `toPageHead(match.pathname, …)`.
 */
export function toPageHead(
  pathname: string,
  pickCopy: (messages: Messages) => { title: string; description: string },
) {
  const messages = toMessagesFromLocale(toLocaleFromPathname(pathname))
  const { title, description } = pickCopy(messages)
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: messages.site.name },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
    ],
  }
}
