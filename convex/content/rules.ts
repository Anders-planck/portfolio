import { type Infer, v } from 'convex/values'
import { vLocale } from './locales'
import { type Snapshot, vCollection } from './snapshot'

/**
 * Publish rules hook. Publish runs every rule on the server against the full
 * snapshot (all locales); a `block` finding aborts the publish, `warn` findings
 * are returned and stored with the release. The rules engine (later ticket)
 * fills `publishRules`; the same rule code also runs live in the CMS editors.
 */
export const vFinding = v.object({
  rule: v.string(),
  severity: v.union(v.literal('block'), v.literal('warn')),
  /** Field path inside the document, e.g. `content.subtitle`. */
  field: v.string(),
  /** Null for shared (non-localized) fields. */
  locale: v.union(vLocale, v.null()),
  message: v.string(),
})
export type Finding = Infer<typeof vFinding>

/** A finding tagged with the document it is about, as publish reports it. */
export const vDocumentFinding = vFinding.extend({
  collection: vCollection,
  key: v.string(),
})
export type DocumentFinding = Infer<typeof vDocumentFinding>

export type Rule = (snapshot: Snapshot) => Finding[]

/** The server-side rule set. Empty until the rules engine lands. */
export const publishRules: Rule[] = []

export function runRules(
  snapshots: Snapshot[],
  rules: Rule[] = publishRules,
): DocumentFinding[] {
  return snapshots.flatMap((snapshot) =>
    rules.flatMap((rule) =>
      rule(snapshot).map((finding) => ({
        ...finding,
        collection: snapshot.collection,
        key: snapshot.key,
      })),
    ),
  )
}

export function blocks(findings: DocumentFinding[]) {
  return findings.some((finding) => finding.severity === 'block')
}
