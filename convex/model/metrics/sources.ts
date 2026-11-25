import { type Infer, v } from 'convex/values'

/**
 * Sources: where a metric's figure comes from and how often it is read.
 * Automated sources are read by the refresh (cron or "Aggiorna ora"); a manual
 * one is a count the owner records with its evidence.
 */

export const cadenceValidator = v.union(v.literal('daily'), v.literal('weekly'))
export type Cadence = Infer<typeof cadenceValidator>

export const automatedSourceValidator = v.union(
  /** Downloads in the last year, from the npm downloads API. */
  v.object({
    kind: v.literal('npm'),
    packageName: v.string(),
    cadence: cadenceValidator,
  }),
  /**
   * The author's commits summed over repositories, with the total of all
   * contributors, from the GitHub contributors API.
   */
  v.object({
    kind: v.literal('github-commits'),
    /** `owner/name` for each repository. */
    repos: v.array(v.string()),
    login: v.string(),
    /** Private repositories: refuse to read without `GITHUB_TOKEN`. */
    needsToken: v.boolean(),
    cadence: cadenceValidator,
  }),
  /** The number of results of a GitHub issues/PR search query. */
  v.object({
    kind: v.literal('github-search'),
    query: v.string(),
    needsToken: v.boolean(),
    cadence: cadenceValidator,
  }),
)
export type AutomatedSource = Infer<typeof automatedSourceValidator>

export const sourceValidator = v.union(
  ...automatedSourceValidator.members,
  /** A count the owner records by hand, with evidence; expires after 90 days. */
  v.object({ kind: v.literal('manual') }),
)
export type Source = Infer<typeof sourceValidator>
