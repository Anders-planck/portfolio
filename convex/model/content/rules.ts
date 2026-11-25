import { type Infer, v } from 'convex/values'

import { localeValidator } from './locales'
import { numeralRule } from './numeralrule'
import { collectionValidator, type Snapshot } from './snapshot'

/**
 * Publish rules hook. Publish runs every rule on the server against the full
 * snapshot (all locales); a `block` finding stops the publish, `warn` findings
 * are returned and stored with the release. The rules engine (later ticket)
 * fills `PUBLISH_RULES`; the same rule code also runs live in the CMS editors.
 */
export const findingValidator = v.object({
  rule: v.string(),
  severity: v.union(v.literal('block'), v.literal('warn')),
  /** Field path inside the document, e.g. `subtitle` or `skills.frontend`. */
  field: v.string(),
  /** Null for shared (non-localized) fields. */
  locale: v.union(localeValidator, v.null()),
  message: v.string(),
})
export type Finding = Infer<typeof findingValidator>

/** A finding tagged with the document it is about, as publish reports it. */
export const documentFindingValidator = findingValidator.extend({
  collection: collectionValidator,
  key: v.string(),
})
export type DocumentFinding = Infer<typeof documentFindingValidator>

export type Rule = (snapshot: Snapshot) => Finding[]

/** The server-side rule set; the other rules land with ticket 15a (#22). */
export const PUBLISH_RULES: readonly Rule[] = [numeralRule]

export function runPublishRules(
  snapshots: Snapshot[],
  rules: readonly Rule[],
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

export function hasBlockingFinding(findings: DocumentFinding[]) {
  return findings.some((finding) => finding.severity === 'block')
}
