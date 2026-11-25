import { Selector } from '@astryxdesign/core/Selector'

import type { Id } from '../../../convex/_generated/dataModel'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const CV_COPY = CMS_MESSAGES.profile.cv

export interface CvChoice {
  mediaId: Id<'media'>
  fileName: string
}

/** The PDFs in Media the CV can be, as the Media read stands. */
export type CvChoices =
  | { kind: 'loading' }
  | { kind: 'failed' }
  | { kind: 'ready'; choices: readonly CvChoice[] }

/**
 * The CV the site's header links to: one of the PDFs in Media, or none.
 * The choice is part of the Profile draft, so it goes live on publish.
 * While Media cannot be read the field is off and says why, so an empty
 * list never passes for "no PDFs".
 */
export function ProfileCvField({
  cvMediaId,
  cvChoices,
  onCvChange,
}: {
  cvMediaId: Id<'media'> | null
  cvChoices: CvChoices
  onCvChange: (cvMediaId: Id<'media'> | null) => void
}) {
  const choices = cvChoices.kind === 'ready' ? cvChoices.choices : []
  return (
    <Selector
      label={CV_COPY.label}
      description={CV_COPY.description}
      placeholder={
        cvChoices.kind === 'loading' ? CV_COPY.loading : CV_COPY.placeholder
      }
      emptyText={CV_COPY.empty}
      options={choices.map(({ mediaId, fileName }) => ({
        value: mediaId,
        label: fileName,
      }))}
      value={cvMediaId}
      hasClear
      isDisabled={cvChoices.kind !== 'ready'}
      {...(cvChoices.kind === 'failed'
        ? { disabledMessage: CV_COPY.loadFailed }
        : {})}
      onChange={(value) => {
        onCvChange(
          choices.find((choice) => choice.mediaId === value)?.mediaId ?? null,
        )
      }}
    />
  )
}
