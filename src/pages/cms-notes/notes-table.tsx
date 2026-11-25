import { HStack } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Table, type TableColumn } from '@astryxdesign/core/Table'
import { Text } from '@astryxdesign/core/Text'

import { formatNoteCount } from '../../entities/note/format-note-count'
import type { NoteRow } from '../../entities/note/note-draft'
import { toPublicationLabel } from '../../entities/note/to-publication-label'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import { CMS_PATHNAME } from '../../shared/router/is-cms-pathname'

const NOTES_COPY = CMS_MESSAGES.notes
const { columns } = NOTES_COPY

const COLUMNS: TableColumn<NoteRow>[] = [
  {
    key: 'title',
    header: columns.title,
    renderCell: (row) => (
      <Link href={`${CMS_PATHNAME}/note/${row.key}`}>
        {row.title === '' ? NOTES_COPY.untitled : row.title}
      </Link>
    ),
  },
  {
    key: 'topic',
    header: columns.topic,
    renderCell: (row) => NOTES_COPY.topics[row.topic],
  },
  {
    key: 'status',
    header: columns.status,
    renderCell: (row) => (
      <HStack gap={2} align="center">
        <StatusDot
          variant={toStatusVariant(row.publication.kind)}
          label={toPublicationLabel(row.publication)}
        />
        <Text>{toPublicationLabel(row.publication)}</Text>
      </HStack>
    ),
  },
  {
    key: 'locales',
    header: columns.locales,
    renderCell: (row) =>
      row.locales
        .map((locale) => CMS_MESSAGES.profile.locales[locale])
        .join(NOTES_COPY.localeSeparator),
  },
  {
    key: 'reading',
    header: columns.reading,
    renderCell: (row) =>
      row.readingMinutes === null
        ? NOTES_COPY.noReading
        : NOTES_COPY.readingTime(formatNoteCount(row.readingMinutes, 'it')),
  },
]

function toStatusVariant(kind: NoteRow['publication']['kind']) {
  switch (kind) {
    case 'published':
      return 'success'
    case 'scheduled':
      return 'accent'
    case 'draft':
      return 'warning'
  }
}

/** The CMS Note list as rows: one per note, its title a link to its editor. */
export function NotesTable({ rows }: { rows: NoteRow[] }) {
  return <Table data={rows} columns={COLUMNS} idKey="key" hasHover />
}
