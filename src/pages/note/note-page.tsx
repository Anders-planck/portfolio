import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Heading } from '@astryxdesign/core/Heading'
import { Link } from '@astryxdesign/core/Link'
import { Outline } from '@astryxdesign/core/Outline'
import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useRef } from 'react'

import { NoteBody } from '../../entities/note/note-body'
import { publishedNoteQueryOptions } from '../../entities/note/note-query-options'
import { NoteRuns } from '../../entities/note/note-runs'
import { pickNoteTranslation } from '../../entities/note/pick-note-translation'
import { toPathnameInLocale } from '../../shared/i18n/locale'
import { TranslationFallbackNotice } from '../../shared/i18n/translation-fallback-notice'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'
import { NextNoteCard } from './next-note-card'
import { NoteMeta } from './note-meta'
import { useReadingProgress } from './use-reading-progress'

/**
 * Nota: one published note in the reader's language or its fallback (with
 * the notice), an Outline that follows the reading, a reading ProgressBar
 * and the next older published note. The route loader fills the query; a
 * note unpublished while open shows the empty state.
 */
export function NotePage({ slug }: { slug: string }) {
  const locale = useLocale()
  const { notes, notFound } = useMessages()
  const { data: note } = useSuspenseQuery(publishedNoteQueryOptions(slug))
  const articleRef = useRef<HTMLElement>(null)
  const percentRead = useReadingProgress(articleRef)
  const picked =
    note === null ? null : pickNoteTranslation(note.translations, locale)

  if (note === null || picked === null || picked.kind === 'missing') {
    return (
      <Stack padding={8}>
        <EmptyState title={notFound.title} headingLevel={1} />
      </Stack>
    )
  }
  const translation = picked.content
  const otherLocales = note.translations
    .map((entry) => entry.locale)
    .filter((entryLocale) => entryLocale !== translation.locale)

  return (
    <Stack gap={6} padding={8}>
      <Stack className="sticky top-0 z-10 bg-(--color-background-body)">
        <ProgressBar
          label={notes.progressLabel}
          value={percentRead}
          isLabelHidden
        />
      </Stack>
      <Stack gap={10} className="lg:grid lg:grid-cols-4">
        <Stack gap={4} className="lg:sticky lg:top-8 lg:self-start">
          <Link href={toPathnameInLocale('/note', locale)}>
            {notes.backToNotes}
          </Link>
          {translation.outline.length > 0 && (
            <Outline
              label={notes.outlineLabel}
              items={translation.outline}
              density="compact"
            />
          )}
        </Stack>
        <Stack as="article" ref={articleRef} gap={5} className="lg:col-span-3">
          {picked.kind === 'fallback' && (
            <TranslationFallbackNotice shownLocale={picked.locale} />
          )}
          <NoteMeta
            slug={slug}
            publishedAt={note.publishedAt}
            topic={note.topic}
            readingMinutes={translation.readingMinutes}
            otherLocales={otherLocales}
          />
          <Heading level={1}>
            <NoteRuns runs={translation.title} />
          </Heading>
          <Text type="large" as="p" color="secondary">
            <NoteRuns runs={translation.summary} />
          </Text>
          <NoteBody blocks={translation.blocks} locale={translation.locale} />
          {note.next !== null && <NextNoteCard next={note.next} />}
        </Stack>
      </Stack>
    </Stack>
  )
}
