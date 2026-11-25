import { Card } from '@astryxdesign/core/Card'
import { Heading } from '@astryxdesign/core/Heading'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import { SaveStatus } from '../../entities/draft/save-status'
import { NoteBody } from '../../entities/note/note-body'
import type { EditableNote } from '../../entities/note/note-draft'
import { toPublicationLabel } from '../../entities/note/to-publication-label'
import {
  type LinkableProject,
  NoteEditor,
} from '../../features/note-editor/note-editor'
import { useNoteAutosave } from '../../features/note-editor/use-note-autosave'
import { PublishNoteControls } from '../../features/publish-note/publish-note-controls'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import { isLocale, type Locale, LOCALES } from '../../shared/i18n/locale'
import { NoteChecks } from './note-checks'
import { NoteStructure } from './note-structure'

const NOTES_COPY = CMS_MESSAGES.notes
const EDITOR_COPY = NOTES_COPY.editor

// TODO(#17): the projects collection (ticket 09) fills this list.
const LINKABLE_PROJECTS: readonly LinkableProject[] = []

/**
 * One locale of a note: the form with its autosave, and beside it where the
 * note stands, publish and schedule, its structure, a preview of the saved
 * draft and the rules it breaks. The locale switch waits until every edit
 * is saved, so the next locale opens on fresh values.
 */
export function NoteWorkspace({
  noteKey,
  draft,
  locale,
  onLocaleChange,
}: {
  noteKey: string
  draft: EditableNote
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}) {
  const { saveState, queueEdit, retry } = useNoteAutosave(
    noteKey,
    locale,
    draft.savedAt,
  )
  const isEverythingSaved = saveState.kind === 'saved'

  return (
    <VStack gap={6}>
      <Heading level={1}>
        {draft.content.title === '' ? NOTES_COPY.untitled : draft.content.title}
      </Heading>
      <HStack gap={4} align="center" justify="between" wrap="wrap">
        <SegmentedControl
          label={EDITOR_COPY.localeLabel}
          value={locale}
          isDisabled={!isEverythingSaved}
          onChange={(value) => {
            if (isLocale(value)) {
              onLocaleChange(value)
            }
          }}
        >
          {LOCALES.map((entry) => (
            <SegmentedControlItem
              key={entry}
              value={entry}
              label={CMS_MESSAGES.profile.locales[entry]}
            />
          ))}
        </SegmentedControl>
        <SaveStatus saveState={saveState} onRetry={retry} />
      </HStack>
      <VStack gap={8} className="lg:grid lg:grid-cols-3">
        <VStack className="lg:col-span-2">
          <NoteEditor
            initialFields={draft.fields}
            initialContent={draft.content}
            linkableProjects={LINKABLE_PROJECTS}
            onEdit={queueEdit}
          />
        </VStack>
        <VStack gap={4}>
          <Card padding={5}>
            <VStack gap={3}>
              <Heading level={2}>{EDITOR_COPY.publicationSection}</Heading>
              <Text>{toPublicationLabel(draft.publication)}</Text>
              <PublishNoteControls
                noteKey={noteKey}
                revision={draft.revision}
                isDisabled={!isEverythingSaved}
              />
            </VStack>
          </Card>
          <Card padding={5}>
            <VStack gap={3}>
              <Heading level={2}>{EDITOR_COPY.checksSection}</Heading>
              <NoteChecks findings={draft.findings} />
            </VStack>
          </Card>
          <Card padding={5}>
            <VStack gap={3}>
              <Heading level={2}>{EDITOR_COPY.structureSection}</Heading>
              <NoteStructure
                outline={draft.preview.outline}
                readingMinutes={draft.preview.readingMinutes}
                wordCount={draft.preview.wordCount}
              />
            </VStack>
          </Card>
        </VStack>
      </VStack>
      <Card padding={6}>
        <VStack gap={4}>
          <Heading level={2}>{EDITOR_COPY.previewSection}</Heading>
          <NoteBody blocks={draft.preview.blocks} locale={locale} />
        </VStack>
      </Card>
    </VStack>
  )
}
