import { Card } from '@astryxdesign/core/Card'
import { Link } from '@astryxdesign/core/Link'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import type { NotePage } from '../../entities/note/note-query-options'
import { NoteRuns } from '../../entities/note/note-runs'
import { pickNoteTranslation } from '../../entities/note/pick-note-translation'
import { toPathnameInLocale } from '../../shared/i18n/locale'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'
import { NOTE_COPY } from './note-copy'

/** The link to the next older published note, in the reader's language. */
export function NextNoteCard({
  next,
}: {
  next: NonNullable<NotePage['next']>
}) {
  const locale = useLocale()
  const { notes } = useMessages()
  const copy = NOTE_COPY[locale]
  const picked = pickNoteTranslation(next.translations, locale)
  if (picked.kind === 'missing') {
    return null
  }
  return (
    <Card padding={5}>
      <Stack gap={1}>
        <Text type="supporting" color="secondary">
          {copy.nextNote}
        </Text>
        <Link
          href={toPathnameInLocale(`/note/${next.slug}`, locale)}
          data-cursor={notes.readCursor}
        >
          <NoteRuns runs={picked.content.title} />
        </Link>
      </Stack>
    </Card>
  )
}
