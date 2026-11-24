import { type Infer, v } from 'convex/values'

/**
 * Profile collection: who the owner is. One document (key `main`) with shared
 * fields plus one content record per locale. Feeds Home, Percorso and the CV.
 * Numbers never live here: they are metrics (ADR 0004).
 */
export const profileFieldsValidator = v.object({
  name: v.string(),
  email: v.string(),
  links: v.array(v.object({ label: v.string(), href: v.string() })),
  isAvailable: v.boolean(),
  skills: v.object({
    frontend: v.string(),
    backend: v.string(),
    infra: v.string(),
  }),
})

export const profileContentFieldsValidator = v.object({
  statusLabel: v.string(),
  /** Accessible name of the availability dot next to the status label. */
  availabilityLabel: v.string(),
  titleLine1: v.string(),
  titleLine2: v.string(),
  subtitle: v.string(),
  /** Text of the email link. */
  contactLabel: v.string(),
  languages: v.string(),
})

export type ProfileFields = Infer<typeof profileFieldsValidator>
export type ProfileContentFields = Infer<typeof profileContentFieldsValidator>

/** Values a document or locale record starts from before its first edit. */
export const EMPTY_PROFILE_FIELDS: ProfileFields = {
  name: '',
  email: '',
  links: [],
  isAvailable: false,
  skills: { frontend: '', backend: '', infra: '' },
}

export const EMPTY_PROFILE_CONTENT_FIELDS: ProfileContentFields = {
  statusLabel: '',
  availabilityLabel: '',
  titleLine1: '',
  titleLine2: '',
  subtitle: '',
  contactLabel: '',
  languages: '',
}
