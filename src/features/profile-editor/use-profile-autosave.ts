import { useMutation } from 'convex/react'
import { useCallback } from 'react'

import { api } from '../../../convex/_generated/api'
import { mergeDraftEdits } from '../../entities/draft/merge-draft-edits'
import { useDraftAutosave } from '../../entities/draft/use-draft-autosave'
import {
  type ProfileContent,
  type ProfileEdit,
  type ProfileFields,
  toDraftEditFromProfileEdit,
} from '../../entities/profile/profile-draft'
import type { Locale } from '../../shared/i18n/locale'

/** Autosaves Profile edits in `locale` through `content.saveDraft`. */
export function useProfileAutosave(locale: Locale, lastSavedAt: number | null) {
  const saveDraft = useMutation(api.content.saveDraft)
  const saveEdit = useCallback(
    (edit: ProfileEdit) => saveDraft(toDraftEditFromProfileEdit(edit, locale)),
    [locale, saveDraft],
  )
  return useDraftAutosave({
    saveEdit,
    mergeEdits: mergeDraftEdits<ProfileFields, ProfileContent>,
    lastSavedAt,
  })
}
