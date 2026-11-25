import { type Infer, v } from 'convex/values'

/**
 * Reading a source either gives a figure or fails with a typed reason. A
 * failure never becomes a figure: the last verified reading stays (DATA-03).
 */

export const failureReasonValidator = v.union(
  v.object({ kind: v.literal('network') }),
  v.object({ kind: v.literal('http'), status: v.number() }),
  v.object({ kind: v.literal('invalid-response') }),
  v.object({ kind: v.literal('missing-token') }),
  v.object({ kind: v.literal('author-not-found') }),
  /** A search GitHub did not finish, or more contributor pages than we read. */
  v.object({ kind: v.literal('incomplete') }),
)
export type FailureReason = Infer<typeof failureReasonValidator>

export const attemptValidator = v.object({
  attemptedAt: v.number(),
  outcome: v.union(
    v.object({ kind: v.literal('ok') }),
    v.object({ kind: v.literal('failed'), reason: failureReasonValidator }),
  ),
})
export type Attempt = Infer<typeof attemptValidator>

export const sourceReadingValidator = v.union(
  v.object({
    kind: v.literal('ok'),
    figure: v.object({
      value: v.number(),
      total: v.union(v.number(), v.null()),
    }),
  }),
  v.object({ kind: v.literal('failed'), reason: failureReasonValidator }),
)
export type SourceReading = Infer<typeof sourceReadingValidator>
