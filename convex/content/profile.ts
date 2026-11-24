import { type Infer, v } from 'convex/values'

/**
 * Profile collection: who the owner is. One document (key `main`) with shared
 * fields plus one content record per locale. Feeds Home, Percorso and the CV.
 * Numbers never live here: they are metrics (ADR 0004).
 */
export const vProfileFields = v.object({
  name: v.string(),
  email: v.string(),
  links: v.array(v.object({ label: v.string(), href: v.string() })),
  showAvailability: v.boolean(),
  skills: v.object({
    frontend: v.string(),
    backend: v.string(),
    infra: v.string(),
  }),
})

export const vProfileContentFields = v.object({
  statusLabel: v.string(),
  titleLine1: v.string(),
  titleLine2: v.string(),
  subtitle: v.string(),
  languages: v.string(),
})

export type ProfileFields = Infer<typeof vProfileFields>
export type ProfileContentFields = Infer<typeof vProfileContentFields>

/** Values a document or locale record starts from before its first edit. */
export const emptyProfileFields: ProfileFields = {
  name: '',
  email: '',
  links: [],
  showAvailability: false,
  skills: { frontend: '', backend: '', infra: '' },
}

export const emptyProfileContentFields: ProfileContentFields = {
  statusLabel: '',
  titleLine1: '',
  titleLine2: '',
  subtitle: '',
  languages: '',
}
