import { Link } from '@astryxdesign/core/Link'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Fragment } from 'react'

import { formatNoteCount } from '../../entities/note/format-note-count'
import { formatNoteDate } from '../../entities/note/format-note-date'
import type { NoteTopic } from '../../entities/note/note-query-options'
import { type Locale, toPathnameInLocale } from '../../shared/i18n/locale'
import { toMessagesFromLocale } from '../../shared/i18n/to-messages-from-locale'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'
import { NOTE_PAGE_COPY } from './note-page-copy'

/**
 * The line above a note's title: date, topic and reading time, and links
 * to the note in the other languages it is written in.
 */
export function NoteMeta({
  slug,
  publishedAt,
  topic,
  readingMinutes,
  otherLocales,
}: {
  slug: string
  publishedAt: number
  topic: NoteTopic
  readingMinutes: number
  otherLocales: readonly Locale[]
}) {
  const locale = useLocale()
  const { notes } = useMessages()
  const notePageCopy = NOTE_PAGE_COPY[locale]
  return (
    <Stack direction="horizontal" gap={3} wrap="wrap">
      <Text type="supporting" color="secondary">
        {formatNoteDate(publishedAt, locale)}
      </Text>
      <Text type="supporting" color="secondary">
        {notes.cardMeta(
          notes.topics[topic],
          notes.readingTime(formatNoteCount(readingMinutes, locale)),
        )}
      </Text>
      {otherLocales.length > 0 && (
        <Text type="supporting" color="secondary">
          {notePageCopy.alsoIn}
          {otherLocales.map((otherLocale) => (
            <Fragment key={otherLocale}>
              {' '}
              <Link href={toPathnameInLocale(`/note/${slug}`, otherLocale)}>
                {toMessagesFromLocale(otherLocale).language.code}
              </Link>
            </Fragment>
          ))}
        </Text>
      )}
    </Stack>
  )
}
