import { findMediaReferences, type MediaReference } from '../media/references'
import type { RuleMedia } from '../media/rulemedia'
import type { Locale } from './locales'
import type { RuleContext } from './rulecontext'
import type { Snapshot } from './snapshot'

interface MediaFinding {
  rule: 'missing-media' | 'wrong-media-kind' | 'missing-alt'
  severity: 'block'
  field: string
  locale: Locale | null
  message: string
}

/**
 * The media rule (story 45), all blocking: every media a document points at
 * exists and is the kind its field shows (the CV is a PDF, a figure an
 * image), and every image has alt text in each locale that shows it (the
 * figure's own locale; for a shared field, every locale the document has
 * content in). Same finding shape as `rules.ts`, without importing it
 * (see `numeralrule.ts`).
 */
export function mediaRule(
  snapshot: Snapshot,
  context: RuleContext,
): MediaFinding[] {
  const contentLocales = snapshot.content.map((record) => record.locale)
  return findMediaReferences(snapshot).flatMap((reference) => {
    const media = context.media.get(reference.mediaId)
    if (media === undefined) {
      return [
        toFinding(
          'missing-media',
          reference,
          'The media this field points at does not exist',
        ),
      ]
    }
    if (media.kind !== reference.expectedKind) {
      return [
        toFinding(
          'wrong-media-kind',
          reference,
          `"${media.fileName}" is not ${reference.expectedKind === 'file' ? 'a PDF' : 'an image'}`,
        ),
      ]
    }
    return findMissingAlt(media, reference, contentLocales)
  })
}

function findMissingAlt(
  media: RuleMedia,
  reference: MediaReference,
  contentLocales: Locale[],
): MediaFinding[] {
  if (media.kind === 'file') {
    return []
  }
  const shownIn =
    reference.locale === null ? contentLocales : [reference.locale]
  return shownIn
    .filter((locale) => !media.altLocales.has(locale))
    .map((locale) => ({
      ...toFinding(
        'missing-alt',
        reference,
        `"${media.fileName}" has no alt text in this locale`,
      ),
      locale,
    }))
}

function toFinding(
  rule: MediaFinding['rule'],
  { field, locale }: MediaReference,
  message: string,
): MediaFinding {
  return { rule, severity: 'block', field, locale, message }
}
