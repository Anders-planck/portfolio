import { Selector } from '@astryxdesign/core/Selector'

import type { Id } from '../../../convex/_generated/dataModel'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const CV_COPY = CMS_MESSAGES.profile.cv

export interface CvChoice {
  mediaId: Id<'media'>
  fileName: string
}

/**
 * The CV the site's header links to: one of the PDFs in Media, or none.
 * The choice is part of the Profile draft, so it goes live on publish.
 */
export function ProfileCvField({
  cvMediaId,
  cvChoices,
  onCvChange,
}: {
  cvMediaId: Id<'media'> | null
  cvChoices: readonly CvChoice[]
  onCvChange: (cvMediaId: Id<'media'> | null) => void
}) {
  return (
    <Selector
      label={CV_COPY.label}
      description={CV_COPY.description}
      placeholder={CV_COPY.placeholder}
      emptyText={CV_COPY.empty}
      options={cvChoices.map(({ mediaId, fileName }) => ({
        value: mediaId,
        label: fileName,
      }))}
      value={cvMediaId}
      hasClear
      onChange={(value) => {
        onCvChange(
          cvChoices.find((choice) => choice.mediaId === value)?.mediaId ?? null,
        )
      }}
    />
  )
}
