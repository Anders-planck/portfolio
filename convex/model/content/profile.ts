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
  /**
   * The CV the header links to: a PDF in Media, or null. Optional because
   * drafts and versions written before it existed lack it; readers turn a
   * missing value into null.
   */
  cvMediaId: v.optional(v.union(v.id('media'), v.null())),
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

/**
 * The per-locale content fields of a record that carries more (a table row,
 * a snapshot entry). The one place that lists them, so a new field is added
 * here and in the validator only.
 */
export function pickProfileContentFields(
  record: ProfileContentFields,
): ProfileContentFields {
  return {
    statusLabel: record.statusLabel,
    availabilityLabel: record.availabilityLabel,
    titleLine1: record.titleLine1,
    titleLine2: record.titleLine2,
    subtitle: record.subtitle,
    contactLabel: record.contactLabel,
    languages: record.languages,
  }
}

/** Values a document or locale record starts from before its first edit. */
export const EMPTY_PROFILE_FIELDS: ProfileFields = {
  name: '',
  email: '',
  links: [],
  isAvailable: false,
  skills: { frontend: '', backend: '', infra: '' },
  cvMediaId: null,
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
