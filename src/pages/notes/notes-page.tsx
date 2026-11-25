import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Heading } from '@astryxdesign/core/Heading'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { List, ListItem } from '@astryxdesign/core/List'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'

import {
  formatNoteCount,
  formatNoteDate,
} from '../../entities/note/format-note-date'
import {
  type NoteTopic,
  publishedNotesQueryOptions,
} from '../../entities/note/note-query-options'
import { NoteRuns } from '../../entities/note/note-runs'
import { toPathnameInLocale } from '../../shared/i18n/locale'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'
import {
  ALL_TOPICS,
  countNotesByTopic,
  toNoteListEntries,
  type TopicFilter,
} from './to-note-list-entries'

/**
 * Note: the published notes, newest first, each in the reader's language
 * or its fallback, with a topic filter whose counts are published notes
 * only (resolution 12). The route loader fills the query, so it never waits.
 */
export function NotesPage() {
  const locale = useLocale()
  const { notes } = useMessages()
  const { data: cards } = useSuspenseQuery(publishedNotesQueryOptions())
  const [topic, setTopic] = useState<TopicFilter>(ALL_TOPICS)
  const entries = toNoteListEntries(cards, locale)
  const counts = countNotesByTopic(entries)
  const shown = entries.filter(
    (entry) => topic === ALL_TOPICS || entry.topic === topic,
  )
  const formatCount = (count: number) => formatNoteCount(count, locale)

  return (
    <Layout height="auto">
      <LayoutContent padding={8}>
        <Stack gap={8}>
          <Stack gap={3}>
            <Heading level={1}>{notes.title}</Heading>
            <Text type="large" as="p" color="secondary">
              {notes.intro}
            </Text>
          </Stack>
          {entries.length === 0 ? (
            <EmptyState title={notes.emptyTitle} headingLevel={2} />
          ) : (
            <Stack gap={6}>
              <SegmentedControl
                label={notes.topicFilterLabel}
                value={topic}
                onChange={(value) => {
                  setTopic(toTopicFilter(value, counts))
                }}
              >
                <SegmentedControlItem
                  value={ALL_TOPICS}
                  label={notes.topicOption(
                    notes.allTopics,
                    formatCount(entries.length),
                  )}
                />
                {[...counts].map(([noteTopic, count]) => (
                  <SegmentedControlItem
                    key={noteTopic}
                    value={noteTopic}
                    label={notes.topicOption(
                      notes.topics[noteTopic],
                      formatCount(count),
                    )}
                  />
                ))}
              </SegmentedControl>
              {shown.length === 0 ? (
                <EmptyState title={notes.emptyTopicTitle} headingLevel={2} />
              ) : (
                <List hasDividers>
                  {shown.map((entry) => (
                    <ListItem
                      key={entry.slug}
                      href={toPathnameInLocale(`/note/${entry.slug}`, locale)}
                      data-cursor={notes.readCursor}
                      label={<NoteRuns runs={entry.title} />}
                      description={<NoteRuns runs={entry.summary} />}
                      startContent={
                        <Text type="code" color="secondary">
                          {formatNoteDate(entry.publishedAt, locale)}
                        </Text>
                      }
                      endContent={
                        <Text type="supporting" color="secondary">
                          {notes.cardMeta(
                            notes.topics[entry.topic],
                            notes.readingTime(
                              formatNoteCount(entry.readingMinutes, locale),
                            ),
                          )}
                        </Text>
                      }
                    />
                  ))}
                </List>
              )}
            </Stack>
          )}
        </Stack>
      </LayoutContent>
    </Layout>
  )
}

function toTopicFilter(
  value: string,
  counts: ReadonlyMap<NoteTopic, number>,
): TopicFilter {
  return [...counts.keys()].find((topic) => topic === value) ?? ALL_TOPICS
}
