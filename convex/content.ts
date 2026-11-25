import { v } from 'convex/values'

import { internal } from './_generated/api'
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from './_generated/server'
import {
  draftEditValidator,
  type PreviewOutcome,
  previewOutcomeValidator,
  readDraftPreview,
  saveDraftEdit,
} from './model/content/drafts'
import { localeValidator } from './model/content/locales'
import { readPublishedDocument } from './model/content/pointers'
import { issuePreviewToken, openPreviewToken } from './model/content/preview'
import {
  publishOutcomeValidator,
  publishScheduledRelease,
  publishSelection,
} from './model/content/releases'
import { rollBackToRelease } from './model/content/rollback'
import {
  collectionValidator,
  localizedDocumentValidator,
  reviewedDraftValidator,
} from './model/content/snapshot'
import { readPreviewTokenSecret } from './model/env'
import { requireOwner } from './model/owner'

/**
 * Content store (ADR 0003): `saveDraft`, `publish`, `rollback`,
 * `getPublished`, `getDraft`. The CMS functions are internal until owner auth
 * exists (ticket 04, see `model/owner.ts`); the public site and preview only
 * read.
 */

/** Live-saves an edit; the returned revision is what publish checks against. */
export const saveDraft = internalMutation({
  args: draftEditValidator,
  returns: v.object({ savedAt: v.number(), revision: v.number() }),
  handler: async (ctx, edit) => {
    await requireOwner()
    const savedAt = Date.now()
    const { revision } = await saveDraftEdit(ctx, edit, savedAt)
    return { savedAt, revision }
  },
})

/**
 * Publishes the selected drafts now, or schedules them for `scheduledAt` (epoch ms).
 * `requestId` makes it idempotent: repeating it returns the first release.
 */
export const publish = internalMutation({
  args: {
    selection: v.array(reviewedDraftValidator),
    note: v.string(),
    requestId: v.string(),
    scheduledAt: v.optional(v.number()),
  },
  returns: publishOutcomeValidator,
  handler: async (ctx, request) => {
    await requireOwner()
    return publishSelection(ctx, request, Date.now())
  },
})

/** Scheduler target: makes a scheduled release live when it comes due. */
export const publishScheduled = internalMutation({
  args: { releaseId: v.id('releases') },
  returns: v.null(),
  handler: async (ctx, { releaseId }) => {
    await publishScheduledRelease(ctx, releaseId, Date.now())
    return null
  },
})

/**
 * Restores the site as it was right after an earlier published release
 * (documents first published later are unpublished), as a new release.
 * `requestId` makes it idempotent: repeating it returns the first rollback.
 */
export const rollback = internalMutation({
  args: { releaseId: v.id('releases'), requestId: v.string() },
  returns: v.object({ releaseId: v.id('releases') }),
  handler: async (ctx, { releaseId: targetId, requestId }) => {
    await requireOwner()
    const releaseId = await rollBackToRelease(
      ctx,
      { targetId, requestId },
      Date.now(),
    )
    return { releaseId }
  },
})

/** What the public site reads: the published document in one locale. */
export const getPublished = query({
  args: {
    collection: collectionValidator,
    key: v.string(),
    locale: localeValidator,
  },
  returns: v.union(localizedDocumentValidator, v.null()),
  handler: (ctx, { locale, ...ref }) => readPublishedDocument(ctx, ref, locale),
})

/** A preview link for one document in one locale, valid for an hour. */
export const createPreviewToken = internalMutation({
  args: {
    collection: collectionValidator,
    key: v.string(),
    locale: localeValidator,
  },
  returns: v.object({ token: v.string(), expiresAt: v.number() }),
  handler: async (_ctx, target) => {
    await requireOwner()
    return issuePreviewToken(target, {
      secret: readPreviewTokenSecret(),
      now: Date.now(),
    })
  },
})

/**
 * What preview reads: the draft a token was issued for, or `expired` /
 * `no-draft`; a token this backend did not sign throws. An action, so the
 * expiry is checked against the clock on every call (a query result could be
 * served from cache after the link expired).
 */
export const getDraft = action({
  args: { token: v.string() },
  returns: previewOutcomeValidator,
  handler: async (ctx, { token }): Promise<PreviewOutcome> => {
    const opened = await openPreviewToken(token, {
      secret: readPreviewTokenSecret(),
      now: Date.now(),
    })
    if (opened.status === 'expired') {
      return opened
    }
    const { collection, key, locale } = opened.claims
    return ctx.runQuery(internal.content.readDraftForPreview, {
      collection,
      key,
      locale,
    })
  },
})

/** Reads the draft for a preview token `getDraft` has already checked. */
export const readDraftForPreview = internalQuery({
  args: {
    collection: collectionValidator,
    key: v.string(),
    locale: localeValidator,
  },
  returns: previewOutcomeValidator,
  handler: (ctx, target) => readDraftPreview(ctx, target),
})
