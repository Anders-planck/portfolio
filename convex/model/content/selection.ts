import { ConvexError } from 'convex/values'

import { type DocumentRef, toDocumentPath } from './snapshot'

/** Limits of one publish request: a release is reviewed by a person. */
export const MAX_SELECTION = 100
export const MAX_NOTE_LENGTH = 500

/**
 * Refuses a publish request that is empty, too large, names a document
 * twice or has a note over the limit. The CMS never sends one, so these are
 * errors, not results.
 */
export function checkPublishRequest({
  selection,
  note,
}: {
  selection: DocumentRef[]
  note: string
}) {
  if (selection.length === 0 || selection.length > MAX_SELECTION) {
    throwInvalidPublishRequest(
      `A release holds at least one and at most ${String(MAX_SELECTION)} documents`,
    )
  }
  const paths = selection.map(toDocumentPath)
  const repeatedPath = paths.find(
    (path, index) => paths.indexOf(path) !== index,
  )
  if (repeatedPath !== undefined) {
    throwInvalidPublishRequest(`${repeatedPath} is selected more than once`)
  }
  if (note.length > MAX_NOTE_LENGTH) {
    throwInvalidPublishRequest(
      `A release note holds at most ${String(MAX_NOTE_LENGTH)} characters`,
    )
  }
}

function throwInvalidPublishRequest(message: string): never {
  throw new ConvexError({ code: 'INVALID_PUBLISH_REQUEST', message })
}
