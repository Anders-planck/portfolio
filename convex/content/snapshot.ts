import { type Infer, v } from 'convex/values'
import { vLocale } from './locales'
import { vProfileContentFields, vProfileFields } from './profile'

/** Collections the store knows. Each one adds a literal and a snapshot shape. */
export const vCollection = v.union(v.literal('profile'))
export type Collection = Infer<typeof vCollection>

/**
 * A whole document at one point in time: shared fields plus every locale.
 * Versions store it, rules read it, preview and the public site render it.
 */
export const vSnapshot = v.union(
  v.object({
    collection: v.literal('profile'),
    key: v.string(),
    fields: vProfileFields,
    content: v.array(vProfileContentFields.extend({ locale: vLocale })),
  }),
)
export type Snapshot = Infer<typeof vSnapshot>

/** One document as one locale sees it; `content` is null if that locale has none. */
export const vLocalizedDocument = v.union(
  v.object({
    collection: v.literal('profile'),
    key: v.string(),
    locale: vLocale,
    fields: vProfileFields,
    content: v.union(vProfileContentFields, v.null()),
  }),
)
export type LocalizedDocument = Infer<typeof vLocalizedDocument>

export function localize(
  snapshot: Snapshot,
  locale: Infer<typeof vLocale>,
): LocalizedDocument {
  const record = snapshot.content.find((entry) => entry.locale === locale)
  if (!record) {
    return { ...snapshot, locale, content: null }
  }
  const { locale: _, ...content } = record
  return { ...snapshot, locale, content }
}
