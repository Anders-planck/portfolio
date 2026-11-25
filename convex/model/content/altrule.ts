import { findMediaReferences } from '../media/references'
import type { Locale } from './locales'
import type { RuleContext } from './rulecontext'
import type { Snapshot } from './snapshot'

interface AltFinding {
  rule: 'missing-alt' | 'missing-media'
  severity: 'block'
  field: string
  locale: Locale | null
  message: string
}

/**
 * The alt rule (story 45): every image a document points at has alt text in
 * each locale the document has content in, so no published page shows an
 * image without one. Files (the CV) need none. A reference to media that no
 * longer exists blocks too: the page would show a hole. Same finding shape
 * as `rules.ts`, without importing it (see `numeralrule.ts`).
 */
export function altRule(
  snapshot: Snapshot,
  context: RuleContext,
): AltFinding[] {
  const locales = snapshot.content.map((record) => record.locale)
  return findMediaReferences(snapshot).flatMap(
    ({ mediaId, field }): AltFinding[] => {
      const media = context.media.get(mediaId)
      if (media === undefined) {
        return [
          {
            rule: 'missing-media',
            severity: 'block',
            field,
            locale: null,
            message: 'The media this field points at does not exist',
          },
        ]
      }
      if (media.kind === 'file') {
        return []
      }
      return locales
        .filter((locale) => !media.altLocales.has(locale))
        .map((locale) => ({
          rule: 'missing-alt',
          severity: 'block',
          field,
          locale,
          message: `"${media.fileName}" has no alt text in this locale`,
        }))
    },
  )
}
