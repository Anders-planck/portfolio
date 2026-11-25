import { Banner } from '@astryxdesign/core/Banner'
import { Heading } from '@astryxdesign/core/Heading'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { SaveStatus } from '../../entities/draft/save-status'
import { mediaLibraryQueryOptions } from '../../entities/media/media-library-query-options'
import {
  type EditableProfileDraft,
  profileDraftQueryOptions,
} from '../../entities/profile/profile-draft'
import type { CvChoices } from '../../features/profile-editor/profile-cv-field'
import { ProfileEditor } from '../../features/profile-editor/profile-editor'
import { useProfileAutosave } from '../../features/profile-editor/use-profile-autosave'
import { PublishProfileButton } from '../../features/publish-profile/publish-profile-button'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
  LOCALES,
} from '../../shared/i18n/locale'

const PROFILE_COPY = CMS_MESSAGES.profile

/** `/cms/profilo`: edit the Profile draft, saved as you type, and publish it. */
export function CmsProfilePage() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  const draft = useQuery(profileDraftQueryOptions(locale))
  const cvChoices = useCvChoices()

  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <Heading level={1}>{PROFILE_COPY.title}</Heading>
        <Text type="body" as="p">
          {PROFILE_COPY.description}
        </Text>
      </VStack>
      {draft.isPending && (
        <Text type="body" role="status">
          {PROFILE_COPY.loading}
        </Text>
      )}
      {draft.isError && (
        <Banner status="error" title={PROFILE_COPY.errorTitle} />
      )}
      {draft.isSuccess && (
        // Keyed by locale: each locale opens with its own saved values.
        <ProfileDraftWorkspace
          key={locale}
          draft={draft.data}
          locale={locale}
          cvChoices={cvChoices}
          onLocaleChange={setLocale}
        />
      )}
    </VStack>
  )
}

/**
 * The editor of one locale with its autosave and publish. The locale switch
 * waits until every edit is saved, so the next locale opens on fresh values.
 */
function ProfileDraftWorkspace({
  draft,
  locale,
  cvChoices,
  onLocaleChange,
}: {
  draft: EditableProfileDraft
  locale: Locale
  cvChoices: CvChoices
  onLocaleChange: (locale: Locale) => void
}) {
  const { saveState, queueEdit, retry } = useProfileAutosave(
    locale,
    draft.savedAt,
  )
  const isEverythingSaved = saveState.kind === 'saved'

  return (
    <VStack gap={6}>
      <HStack gap={4} align="center" justify="between">
        <SegmentedControl
          label={PROFILE_COPY.localeLabel}
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
              label={PROFILE_COPY.locales[entry]}
            />
          ))}
        </SegmentedControl>
        <SaveStatus saveState={saveState} onRetry={retry} />
      </HStack>
      <PublishProfileButton
        revision={draft.revision}
        isDisabled={!isEverythingSaved}
      />
      <ProfileEditor
        initialFields={draft.fields}
        initialContent={draft.content}
        cvChoices={cvChoices}
        onEdit={queueEdit}
      />
    </VStack>
  )
}

/** The files in Media the CV can be, with the state of the Media read. */
function useCvChoices(): CvChoices {
  const library = useQuery(mediaLibraryQueryOptions())
  if (library.isError) {
    return { kind: 'failed' }
  }
  if (library.isPending) {
    return { kind: 'loading' }
  }
  return {
    kind: 'ready',
    choices: library.data.media
      .filter((entry) => entry.kind === 'file')
      .map(({ mediaId, fileName }) => ({ mediaId, fileName })),
  }
}
