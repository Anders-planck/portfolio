import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalMutation, query } from './_generated/server'
import {
  draftEditValidator,
  readDraftForPreview,
  saveDraftEdit,
} from './model/content/drafts'
import { localeValidator } from './model/content/locales'
import { PREVIEW_TOKEN_TTL_MS, signPreviewToken } from './model/content/preview'
import {
  publishOutcomeValidator,
  publishScheduledRelease,
  publishSelection,
  readPublishedDocument,
  rollBackToRelease,
} from './model/content/releases'
import {
  collectionValidator,
  documentRefValidator,
  localizedDocumentValidator,
} from './model/content/snapshot'
import { readPreviewTokenSecret } from './model/env'
import { requireOwner } from './model/owner'

/**
 * Content store (ADR 0003): `saveDraft`, `publish`, `rollback`,
 * `getPublished`, `getDraft`. The CMS functions are internal until owner auth
 * exists (ticket 04, see `model/owner.ts`); the public site and preview only
 * read.
 */

/** Live-saves an edit to a document's draft. */
export const saveDraft = internalMutation({
  args: draftEditValidator,
  returns: v.object({ savedAt: v.number() }),
  handler: async (ctx, edit) => {
    await requireOwner()
    const savedAt = Date.now()
    await saveDraftEdit(ctx, edit, savedAt)
    return { savedAt }
  },
})

/** Publishes the selected drafts now, or schedules them for `at` (epoch ms). */
export const publish = internalMutation({
  args: {
    selection: v.array(documentRefValidator),
    note: v.string(),
    at: v.optional(v.number()),
  },
  returns: publishOutcomeValidator,
  handler: async (ctx, request) => {
    await requireOwner()
    const outcome = await publishSelection(ctx, request, Date.now())
    if (outcome.status === 'scheduled' && request.at !== undefined) {
      await ctx.scheduler.runAt(request.at, internal.content.publishScheduled, {
        releaseId: outcome.releaseId,
      })
    }
    return outcome
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

/** Makes an earlier published release live again, as a new release. */
export const rollback = internalMutation({
  args: { releaseId: v.id('releases') },
  returns: v.object({ releaseId: v.id('releases') }),
  handler: async (ctx, { releaseId }) => {
    await requireOwner()
    return { releaseId: await rollBackToRelease(ctx, releaseId, Date.now()) }
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
  handler: async (_ctx, claims) => {
    await requireOwner()
    const expiresAt = Date.now() + PREVIEW_TOKEN_TTL_MS
    const token = await signPreviewToken(
      { ...claims, expiresAt },
      readPreviewTokenSecret(),
    )
    return { token, expiresAt }
  },
})

/**
 * What preview reads: the draft a token was issued for, or null if the token
 * is bad or expired. Expiry is checked when the query runs.
 */
export const getDraft = query({
  args: { token: v.string() },
  returns: v.union(localizedDocumentValidator, v.null()),
  handler: (ctx, { token }) =>
    readDraftForPreview(ctx, token, {
      secret: readPreviewTokenSecret(),
      now: Date.now(),
    }),
})
