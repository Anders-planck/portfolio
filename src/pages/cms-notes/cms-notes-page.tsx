import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Heading } from '@astryxdesign/core/Heading'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useRef, useState } from 'react'

import { api } from '../../../convex/_generated/api'
import { formatNoteCount } from '../../entities/note/format-note-count'
import { noteRowsQueryOptions } from '../../entities/note/note-draft'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import { CMS_PATHNAME } from '../../shared/router/is-cms-pathname'
import { NotesTable } from './notes-table'
import {
  filterRowsByStatus,
  isStatusFilter,
  STATUS_FILTERS,
  type StatusFilter,
} from './status-filter'

const NOTES_COPY = CMS_MESSAGES.notes

/** `/cms/note`: every note with where it stands, and "Nuova nota". */
export function CmsNotesPage() {
  const rows = useQuery(noteRowsQueryOptions())
  const [filter, setFilter] = useState<StatusFilter>('all')

  return (
    <VStack gap={6}>
      <HStack gap={4} align="center" justify="between" wrap="wrap">
        <VStack gap={2}>
          <Heading level={1}>{NOTES_COPY.title}</Heading>
          <Text type="body" as="p">
            {NOTES_COPY.description}
          </Text>
        </VStack>
        <CreateNoteButton />
      </HStack>
      {rows.isPending && (
        <Text type="body" role="status">
          {NOTES_COPY.loading}
        </Text>
      )}
      {rows.isError && <Banner status="error" title={NOTES_COPY.errorTitle} />}
      {rows.isSuccess && rows.data.length === 0 && (
        <EmptyState title={NOTES_COPY.emptyTitle} headingLevel={2} />
      )}
      {rows.isSuccess && rows.data.length > 0 && (
        <VStack gap={4}>
          <SegmentedControl
            label={NOTES_COPY.statusFilterLabel}
            value={filter}
            onChange={(value) => {
              if (isStatusFilter(value)) {
                setFilter(value)
              }
            }}
          >
            {STATUS_FILTERS.map((status) => (
              <SegmentedControlItem
                key={status}
                value={status}
                label={NOTES_COPY.filterOption(
                  NOTES_COPY.statusFilters[status],
                  formatNoteCount(
                    filterRowsByStatus(rows.data, status).length,
                    'it',
                  ),
                )}
              />
            ))}
          </SegmentedControl>
          {filterRowsByStatus(rows.data, filter).length === 0 ? (
            <EmptyState title={NOTES_COPY.emptyFilterTitle} headingLevel={2} />
          ) : (
            <NotesTable rows={filterRowsByStatus(rows.data, filter)} />
          )}
        </VStack>
      )}
    </VStack>
  )
}

/**
 * Creates an empty note and opens its editor. The key is kept until the
 * create is confirmed, so a retry after a lost answer is the same note.
 */
function CreateNoteButton() {
  const createNote = useMutation(api.notes.createNote)
  const navigate = useNavigate()
  const pendingKey = useRef<string | null>(null)
  const [problem, setProblem] = useState<CreateProblem | null>(null)

  const createAndOpen = async () => {
    pendingKey.current ??= crypto.randomUUID()
    try {
      const creation = await createNote({ key: pendingKey.current })
      pendingKey.current = null
      if (creation.kind === 'limit-reached') {
        setProblem('limit-reached')
        return
      }
      await navigate({ to: `${CMS_PATHNAME}/note/${creation.key}` })
    } catch {
      setProblem('failed')
    }
  }

  return (
    <VStack gap={2}>
      <Button
        variant="primary"
        label={NOTES_COPY.create}
        clickAction={createAndOpen}
      />
      {problem !== null && (
        <Banner
          status="error"
          title={
            problem === 'failed'
              ? NOTES_COPY.createFailed
              : NOTES_COPY.limitReached
          }
        />
      )}
    </VStack>
  )
}

/** Why "Nuova nota" opened nothing: the answer was lost, or the limit is hit. */
type CreateProblem = 'failed' | 'limit-reached'
