import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import type { NotePublication } from './note-draft'

const { statuses } = CMS_MESSAGES.notes

const DATE_FORMAT = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** Where a note stands, as the CMS says it: "Programmata · 2 dic 2026, 09:00". */
export function toPublicationLabel(publication: NotePublication): string {
  switch (publication.kind) {
    case 'draft':
      return statuses.draft
    case 'scheduled':
      return statuses.scheduled(DATE_FORMAT.format(publication.scheduledAt))
    case 'published':
      return publication.scheduledEditAt === null
        ? statuses.published(DATE_FORMAT.format(publication.publishedAt))
        : statuses.publishedWithScheduledEdit(
            DATE_FORMAT.format(publication.publishedAt),
            DATE_FORMAT.format(publication.scheduledEditAt),
          )
  }
}
