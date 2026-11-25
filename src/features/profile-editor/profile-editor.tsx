import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Heading } from '@astryxdesign/core/Heading'
import { Section } from '@astryxdesign/core/Section'
import { VStack } from '@astryxdesign/core/Stack'
import { Switch } from '@astryxdesign/core/Switch'
import { TextArea } from '@astryxdesign/core/TextArea'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useState } from 'react'

import type {
  ProfileContent,
  ProfileEdit,
  ProfileFields,
} from '../../entities/profile/profile-draft'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import { ProfileLinksEditor } from './profile-links-editor'

const PROFILE_COPY = CMS_MESSAGES.profile
type Skill = keyof ProfileFields['skills']

const HERO_LINE_FIELDS = [
  'statusLabel',
  'availabilityLabel',
  'titleLine1',
  'titleLine2',
] as const satisfies readonly (keyof ProfileContent)[]
const SKILLS: readonly Skill[] = ['frontend', 'backend', 'infra']

/**
 * The Profile form in one locale: hero, contacts, social links, skills and
 * languages (story 28). It owns the values being typed (LEN-05) and hands
 * each change to `onEdit`, which saves it; the CMS keys it by locale.
 */
export function ProfileEditor({
  initialFields,
  initialContent,
  onEdit,
}: {
  initialFields: ProfileFields
  initialContent: ProfileContent
  onEdit: (edit: ProfileEdit) => void
}) {
  const [fields, setFields] = useState(initialFields)
  const [content, setContent] = useState(initialContent)

  const editFields = (edit: Partial<ProfileFields>) => {
    setFields((current) => ({ ...current, ...edit }))
    onEdit({ fields: edit })
  }
  const editContent = (edit: Partial<ProfileContent>) => {
    setContent((current) => ({ ...current, ...edit }))
    onEdit({ content: edit })
  }

  return (
    <VStack gap={8}>
      <Section>
        <FormLayout>
          <Heading level={2}>{PROFILE_COPY.heroSection}</Heading>
          <Switch
            label={PROFILE_COPY.fields.isAvailable}
            value={fields.isAvailable}
            onChange={(isAvailable) => {
              editFields({ isAvailable })
            }}
          />
          {HERO_LINE_FIELDS.map((field) => (
            <TextInput
              key={field}
              label={PROFILE_COPY.fields[field]}
              value={content[field]}
              onChange={(value) => {
                editContent({ [field]: value })
              }}
            />
          ))}
          <TextArea
            label={PROFILE_COPY.fields.subtitle}
            value={content.subtitle}
            onChange={(subtitle) => {
              editContent({ subtitle })
            }}
          />
        </FormLayout>
      </Section>
      <Section>
        <FormLayout>
          <Heading level={2}>{PROFILE_COPY.contactSection}</Heading>
          <TextInput
            label={PROFILE_COPY.fields.name}
            value={fields.name}
            onChange={(name) => {
              editFields({ name })
            }}
          />
          <TextInput
            type="email"
            label={PROFILE_COPY.fields.email}
            value={fields.email}
            onChange={(email) => {
              editFields({ email })
            }}
          />
          <TextInput
            label={PROFILE_COPY.fields.contactLabel}
            value={content.contactLabel}
            onChange={(contactLabel) => {
              editContent({ contactLabel })
            }}
          />
          <ProfileLinksEditor
            links={fields.links}
            onChange={(links) => {
              editFields({ links })
            }}
          />
        </FormLayout>
      </Section>
      <ProfileSkillsSection
        skills={fields.skills}
        languages={content.languages}
        onSkillsChange={(skills) => {
          editFields({ skills })
        }}
        onLanguagesChange={(languages) => {
          editContent({ languages })
        }}
      />
    </VStack>
  )
}

function ProfileSkillsSection({
  skills,
  languages,
  onSkillsChange,
  onLanguagesChange,
}: {
  skills: ProfileFields['skills']
  languages: string
  onSkillsChange: (skills: ProfileFields['skills']) => void
  onLanguagesChange: (languages: string) => void
}) {
  return (
    <Section>
      <FormLayout>
        <Heading level={2}>{PROFILE_COPY.skillsSection}</Heading>
        {SKILLS.map((skill) => (
          <TextInput
            key={skill}
            label={PROFILE_COPY.fields[skill]}
            value={skills[skill]}
            onChange={(value) => {
              onSkillsChange({ ...skills, [skill]: value })
            }}
          />
        ))}
        <TextInput
          label={PROFILE_COPY.fields.languages}
          value={languages}
          onChange={onLanguagesChange}
        />
      </FormLayout>
    </Section>
  )
}
