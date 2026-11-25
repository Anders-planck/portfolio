import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { TextArea } from '@astryxdesign/core/TextArea'
import { useState } from 'react'

import type { MediaEntry } from '../../entities/media/media-library-query-options'
import { CMS_MEDIA_MESSAGES } from '../../shared/i18n/cms-media-messages'
import { type Locale, LOCALES } from '../../shared/i18n/locale'

const ALT_COPY = CMS_MEDIA_MESSAGES.alt

/** Matches the server's limit (`model/media/alts.ts`). */
const MAX_ALT_LENGTH = 300

export interface MediaAltDialogProps {
  entry: MediaEntry
  onSaveAlt: (edit: { locale: Locale; alt: string }) => Promise<unknown>
  onClose: () => void
}

/**
 * The alt text of one image, one field per locale. Each field saves when it
 * loses focus (resolution 14: no save button) and says whether it did.
 * Closing goes through `onClose` only (Escape and the header's close button).
 */
export function MediaAltDialog({
  entry,
  onSaveAlt,
  onClose,
}: MediaAltDialogProps) {
  return (
    <Dialog
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
      purpose="form"
    >
      <Layout
        header={
          <DialogHeader
            title={ALT_COPY.title(entry.fileName)}
            onOpenChange={onClose}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={4}>
              <Text color="secondary">{ALT_COPY.description}</Text>
              {LOCALES.map((locale) => (
                <AltField
                  key={locale}
                  locale={locale}
                  savedAlt={
                    entry.alts.find((record) => record.locale === locale)
                      ?.alt ?? ''
                  }
                  onSaveAlt={onSaveAlt}
                />
              ))}
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  )
}

type SaveState = 'unchanged' | 'saved' | 'failed'

/** The field's status line for each save state (none before the first save). */
const SAVE_STATUS_PROPS = {
  unchanged: {},
  saved: { status: { type: 'success', message: ALT_COPY.saved } },
  failed: { status: { type: 'error', message: ALT_COPY.saveFailed } },
} as const satisfies Record<SaveState, object>

function AltField({
  locale,
  savedAlt,
  onSaveAlt,
}: {
  locale: Locale
  savedAlt: string
  onSaveAlt: MediaAltDialogProps['onSaveAlt']
}) {
  const [alt, setAlt] = useState(savedAlt)
  const [saveState, setSaveState] = useState<SaveState>('unchanged')

  const saveAlt = async () => {
    if (alt.trim() === savedAlt) {
      return
    }
    try {
      await onSaveAlt({ locale, alt })
      setSaveState('saved')
    } catch {
      setSaveState('failed')
    }
  }

  return (
    <TextArea
      label={ALT_COPY.fieldLabel(CMS_MEDIA_MESSAGES.locales[locale])}
      value={alt}
      maxLength={MAX_ALT_LENGTH}
      onChange={setAlt}
      onBlur={() => {
        void saveAlt()
      }}
      {...SAVE_STATUS_PROPS[saveState]}
    />
  )
}
