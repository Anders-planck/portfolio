import { Banner } from '@astryxdesign/core/Banner'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Link } from '@astryxdesign/core/Link'
import { VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { noteDraftQueryOptions } from '../../entities/note/note-draft'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import { DEFAULT_LOCALE, type Locale } from '../../shared/i18n/locale'
import { CMS_PATHNAME } from '../../shared/router/is-cms-pathname'
import { NoteWorkspace } from './note-workspace'

const EDITOR_COPY = CMS_MESSAGES.notes.editor

/** `/cms/note/<key>`: edit one note, saved as you type, and publish it. */
export function CmsNotePage({ noteKey }: { noteKey: string }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  const draft = useQuery(noteDraftQueryOptions(noteKey, locale))

  return (
    <VStack gap={6}>
      <Link href={`${CMS_PATHNAME}/note`}>{EDITOR_COPY.back}</Link>
      {draft.isPending && (
        <Text type="body" role="status">
          {EDITOR_COPY.loading}
        </Text>
      )}
      {draft.isError && (
        <Banner status="error" title={EDITOR_COPY.errorTitle} />
      )}
      {draft.isSuccess && draft.data === null && (
        <EmptyState title={EDITOR_COPY.notFoundTitle} headingLevel={1} />
      )}
      {draft.isSuccess && draft.data !== null && (
        // Keyed by locale: each locale opens with its own saved values.
        <NoteWorkspace
          key={locale}
          noteKey={noteKey}
          draft={draft.data}
          locale={locale}
          onLocaleChange={setLocale}
        />
      )}
    </VStack>
  )
}
