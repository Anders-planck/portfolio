import { v } from 'convex/values'

import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server'
import { localeValidator } from './model/content/locales'
import { readMediaStorageSettings } from './model/env'
import { altSaveOutcomeValidator, saveOwnerAlt } from './model/media/alts'
import { publishedCvValidator, readPublishedCv } from './model/media/cv'
import { mediaMimeValidator, uploadRequestValidator } from './model/media/files'
import { mediaLibraryValidator, readMediaLibrary } from './model/media/library'
import {
  createSignedUpload,
  findMediaByUploadRequest,
  insertUploadedMediaOnce,
  recordStoredUpload,
  uploadCompletionValidator,
  uploadUrlOutcomeValidator,
} from './model/media/uploads'
import { requireOwner, requireOwnerInAction } from './model/owner'

/**
 * Media on R2 (README in `model/media/`). The CMS functions start with the
 * owner check (ADR 0005); the site reads only the published CV.
 */

/** CMS Media: every upload, its alt per locale and where it is used. */
export const listMedia = query({
  args: {},
  returns: mediaLibraryValidator,
  handler: async (ctx) => {
    await requireOwner(ctx)
    return readMediaLibrary(ctx)
  },
})

/** "Carica", step one: a presigned PUT for the checked file. */
export const createUploadUrl = action({
  args: uploadRequestValidator,
  returns: uploadUrlOutcomeValidator,
  handler: async (ctx, request) => {
    await requireOwnerInAction(ctx)
    return createSignedUpload(ctx, request, readMediaStorageSettings())
  },
})

/** "Carica", step two, after the PUT: checks the object and records it. */
export const completeUpload = action({
  args: uploadRequestValidator,
  returns: uploadCompletionValidator,
  handler: async (ctx, request) => {
    await requireOwnerInAction(ctx)
    return recordStoredUpload(ctx, request, readMediaStorageSettings())
  },
})

/** The owner's alt text of an image in one locale. */
export const saveAlt = mutation({
  args: { mediaId: v.id('media'), locale: localeValidator, alt: v.string() },
  returns: altSaveOutcomeValidator,
  handler: async (ctx, edit) => {
    await requireOwner(ctx)
    return saveOwnerAlt(ctx, edit, Date.now())
  },
})

/** The site's CV link (header, footer); null until one is published. */
export const getPublishedCv = query({
  args: {},
  returns: publishedCvValidator,
  handler: (ctx) => readPublishedCv(ctx),
})

export const findUploadedMedia = internalQuery({
  args: { requestId: v.string() },
  returns: v.union(v.id('media'), v.null()),
  handler: (ctx, { requestId }) => findMediaByUploadRequest(ctx, requestId),
})

export const recordUploadedMedia = internalMutation({
  args: {
    ...uploadRequestValidator.fields,
    mime: mediaMimeValidator,
    objectKey: v.string(),
  },
  returns: v.id('media'),
  handler: (ctx, upload) => insertUploadedMediaOnce(ctx, upload, Date.now()),
})
