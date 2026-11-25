import type { FunctionReturnType } from 'convex/server'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'
import type { Locale } from '../../shared/i18n/locale'

/** A published document in one locale, of any collection. */
type PublishedDocument = NonNullable<
  FunctionReturnType<typeof api.content.getPublished>
>

/** The published Profile in one locale; `content` is null when untranslated. */
export type PublishedProfile = Extract<
  PublishedDocument,
  { collection: 'profile' }
>

/**
 * The Profile of a published read, or null. The read names the `profile`
 * collection, so this only narrows the store's union of collections.
 */
export function toPublishedProfile(
  document: PublishedDocument | null | undefined,
): PublishedProfile | null {
  return document?.collection === 'profile' ? document : null
}

/** The published Profile in `locale`, live: a publish reaches open pages. */
export function profileQueryOptions(locale: Locale) {
  return convexQueryOptions(api.content.getPublished, {
    collection: 'profile',
    key: 'main',
    locale,
  })
}
