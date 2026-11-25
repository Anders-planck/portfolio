import type { FunctionArgs, FunctionReturnType } from 'convex/server'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'
import type { Locale } from '../../shared/i18n/locale'

/** The Profile is one document (ADR 0003): collection `profile`, key `main`. */
export const PROFILE_DOCUMENT = { collection: 'profile', key: 'main' } as const

export type EditableProfileDraft = FunctionReturnType<
  typeof api.content.getEditableDraft
>
export type ProfileFields = EditableProfileDraft['fields']
export type ProfileContent = EditableProfileDraft['content']
export type ProfileLink = ProfileFields['links'][number]

/** One live-save edit: some shared fields and/or some fields of the locale. */
export interface ProfileEdit {
  fields?: Partial<ProfileFields>
  content?: Partial<ProfileContent>
}

/** The draft the editor opens in one locale. */
export function profileDraftQueryOptions(locale: Locale) {
  return convexQueryOptions(api.content.getEditableDraft, {
    ...PROFILE_DOCUMENT,
    locale,
  })
}

/** The `saveDraft` arguments for an edit of the Profile in `locale`. */
export function toDraftEditFromProfileEdit(
  edit: ProfileEdit,
  locale: Locale,
): FunctionArgs<typeof api.content.saveDraft> {
  return {
    ...PROFILE_DOCUMENT,
    ...(edit.fields === undefined ? {} : { fields: edit.fields }),
    ...(edit.content === undefined
      ? {}
      : { localeEdit: { locale, content: edit.content } }),
  }
}
