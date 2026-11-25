import type { Locale } from '../content/locales'
import type { Snapshot } from '../content/snapshot'
import { parseNoteMarkdown } from '../notes/markdown'
import type { MediaKind } from './files'

/**
 * Where a document points at media (pure): the one place that knows each
 * collection's media fields, so usage, the media rule and rendering cannot
 * disagree. A new collection with media fields adds its case here.
 */

export interface MediaReference {
  /** As written in the document: an id the rule checks, not trusts. */
  mediaId: string
  /** Field path inside the document, as rule findings name it. */
  field: string
  /** The locale whose content holds it; null for a shared field. */
  locale: Locale | null
  /** What the field shows: a file (the CV) or an image (a figure). */
  expectedKind: MediaKind
}

export function findMediaReferences(snapshot: Snapshot): MediaReference[] {
  switch (snapshot.collection) {
    case 'profile': {
      // Absent in Profile drafts and versions written before the CV field.
      const cvMediaId = snapshot.fields.cvMediaId ?? null
      return cvMediaId === null
        ? []
        : [
            {
              mediaId: cvMediaId,
              field: 'cvMediaId',
              locale: null,
              expectedKind: 'file',
            },
          ]
    }
    case 'note':
      return snapshot.content.flatMap(({ locale, body }) =>
        listFigureMediaIds(body).map((mediaId) => ({
          mediaId,
          field: 'body',
          locale,
          expectedKind: 'image' as const,
        })),
      )
  }
}

/** The media of every `::figure` in a note body, in order. */
export function listFigureMediaIds(body: string): string[] {
  return parseNoteMarkdown(body).blocks.flatMap((block) =>
    block.kind === 'figure' ? [block.mediaId] : [],
  )
}
