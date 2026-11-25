import { List, ListItem } from '@astryxdesign/core/List'
import { VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import type { EditableNote } from '../../entities/note/note-draft'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const EDITOR_COPY = CMS_MESSAGES.notes.editor
const NUMBER_FORMAT = new Intl.NumberFormat('it-IT', { useGrouping: 'always' })

/** The draft's sections, as the public Outline will list them, and its length. */
export function NoteStructure({
  outline,
  readingMinutes,
  wordCount,
}: {
  outline: EditableNote['preview']['outline']
  readingMinutes: number
  wordCount: number
}) {
  return (
    <VStack gap={3}>
      {outline.length === 0 ? (
        <Text color="secondary">{EDITOR_COPY.structureEmpty}</Text>
      ) : (
        <List listStyle="decimal" density="compact">
          {outline.map((entry) => (
            <ListItem key={entry.id} label={entry.label} />
          ))}
        </List>
      )}
      <Text type="supporting" color="secondary">
        {EDITOR_COPY.readingSummary(
          NUMBER_FORMAT.format(readingMinutes),
          NUMBER_FORMAT.format(wordCount),
        )}
      </Text>
    </VStack>
  )
}
