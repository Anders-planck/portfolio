import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Heading } from '@astryxdesign/core/Heading'
import { MultiSelector } from '@astryxdesign/core/MultiSelector'
import { Section } from '@astryxdesign/core/Section'
import { Selector } from '@astryxdesign/core/Selector'
import { VStack } from '@astryxdesign/core/Stack'
import { TextArea } from '@astryxdesign/core/TextArea'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useState } from 'react'

import type {
  NoteContent,
  NoteEdit,
  NoteFields,
} from '../../entities/note/note-draft'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const NOTES_COPY = CMS_MESSAGES.notes
const FIELD_COPY = NOTES_COPY.editor.fields

type Topic = NoteFields['topic']

const TOPIC_OPTIONS = (['ai', 'mobile', 'architecture'] as const).map(
  (topic) => ({ value: topic, label: NOTES_COPY.topics[topic] }),
)

/** A project the note can be linked to. */
export interface LinkableProject {
  key: string
  title: string
}

/**
 * The note form in one locale: title, summary, Markdown body, and the
 * shared slug, topic and linked projects. It owns the values being typed
 * (LEN-05) and hands each change to `onEdit`; the CMS keys it by locale.
 */
export function NoteEditor({
  initialFields,
  initialContent,
  linkableProjects,
  onEdit,
}: {
  initialFields: NoteFields
  initialContent: NoteContent
  linkableProjects: readonly LinkableProject[]
  onEdit: (edit: NoteEdit) => void
}) {
  const [fields, setFields] = useState(initialFields)
  const [content, setContent] = useState(initialContent)

  const editFields = (edit: Partial<NoteFields>) => {
    setFields((current) => ({ ...current, ...edit }))
    onEdit({ fields: edit })
  }
  const editContent = (edit: Partial<NoteContent>) => {
    setContent((current) => ({ ...current, ...edit }))
    onEdit({ content: edit })
  }

  return (
    <VStack gap={8}>
      <Section>
        <FormLayout>
          <Heading level={2}>{NOTES_COPY.editor.contentSection}</Heading>
          <TextInput
            label={FIELD_COPY.title}
            value={content.title}
            onChange={(title) => {
              editContent({ title })
            }}
          />
          <TextArea
            label={FIELD_COPY.summary}
            description={FIELD_COPY.summaryHelp}
            value={content.summary}
            onChange={(summary) => {
              editContent({ summary })
            }}
          />
          <TextArea
            label={FIELD_COPY.body}
            description={FIELD_COPY.bodyHelp}
            value={content.body}
            rows={20}
            onChange={(body) => {
              editContent({ body })
            }}
          />
        </FormLayout>
      </Section>
      <Section>
        <FormLayout>
          <Heading level={2}>{NOTES_COPY.editor.publicationSection}</Heading>
          <TextInput
            label={FIELD_COPY.slug}
            description={FIELD_COPY.slugHelp}
            value={fields.slug}
            onChange={(slug) => {
              editFields({ slug })
            }}
          />
          <Selector
            label={FIELD_COPY.topic}
            options={TOPIC_OPTIONS}
            value={fields.topic}
            onChange={(value) => {
              const topic = TOPIC_OPTIONS.find(
                (option) => option.value === value,
              )
              if (topic !== undefined) {
                editFields({ topic: topic.value satisfies Topic })
              }
            }}
          />
          <MultiSelector
            label={FIELD_COPY.linkedProjects}
            description={FIELD_COPY.linkedProjectsHelp}
            options={linkableProjects.map((project) => ({
              value: project.key,
              label: project.title,
            }))}
            emptyText={FIELD_COPY.noProjects}
            value={fields.linkedProjectKeys}
            onChange={(linkedProjectKeys) => {
              editFields({ linkedProjectKeys })
            }}
          />
        </FormLayout>
      </Section>
    </VStack>
  )
}
