import type { NoteRow } from '../../entities/note/note-draft'

/** The filters of the CMS Note list, in the mockup's order. */
export const STATUS_FILTERS = [
  'all',
  'published',
  'draft',
  'scheduled',
] as const satisfies readonly ('all' | NoteRow['publication']['kind'])[]

export type StatusFilter = (typeof STATUS_FILTERS)[number]

export function isStatusFilter(value: string): value is StatusFilter {
  return STATUS_FILTERS.some((filter) => filter === value)
}

/** The notes a filter shows. */
export function filterRowsByStatus(
  rows: readonly NoteRow[],
  filter: StatusFilter,
): NoteRow[] {
  return rows.filter(
    (row) => filter === 'all' || row.publication.kind === filter,
  )
}
