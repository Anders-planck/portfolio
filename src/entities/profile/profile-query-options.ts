import type { FunctionReturnType } from 'convex/server'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'
import type { Locale } from '../../shared/i18n/locale'

/** The published Profile in one locale; `content` is null when untranslated. */
export type PublishedProfile = NonNullable<
  FunctionReturnType<typeof api.content.getPublished>
>

/** The published Profile in `locale`, live: a publish reaches open pages. */
export function profileQueryOptions(locale: Locale) {
  return convexQueryOptions(api.content.getPublished, {
    collection: 'profile',
    key: 'main',
    locale,
  })
}
