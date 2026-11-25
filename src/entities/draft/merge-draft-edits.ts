/**
 * One live-save edit of a document: some shared fields and/or some fields of
 * the locale on screen (the shape every content-store draft saves).
 */
export interface DraftEdit<Fields, Content> {
  fields?: Partial<Fields>
  content?: Partial<Content>
}

/**
 * Later edits win field by field. A part neither edit touched stays absent,
 * so a shared-field edit never creates an empty record for the locale.
 */
export function mergeDraftEdits<Fields, Content>(
  pending: DraftEdit<Fields, Content> | null,
  next: DraftEdit<Fields, Content>,
): DraftEdit<Fields, Content> {
  const fields =
    pending?.fields === undefined && next.fields === undefined
      ? undefined
      : { ...pending?.fields, ...next.fields }
  const content =
    pending?.content === undefined && next.content === undefined
      ? undefined
      : { ...pending?.content, ...next.content }
  return {
    ...(fields === undefined ? {} : { fields }),
    ...(content === undefined ? {} : { content }),
  }
}
