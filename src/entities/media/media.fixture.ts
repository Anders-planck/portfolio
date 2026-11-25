import type { Id } from '../../../convex/_generated/dataModel'
import type { MediaEntry, MediaLibrary } from './media-library-query-options'

/** Media entries as `media.listMedia` returns them, for component tests. */

export const SCREENSHOT_ENTRY: MediaEntry = {
  mediaId: 'media-screenshot' as Id<'media'>,
  fileName: 'bussola-chat.png',
  mime: 'image/png',
  kind: 'image',
  bytes: 240_000,
  widthPx: 1440,
  heightPx: 900,
  uploadedAt: Date.UTC(2026, 10, 25),
  url: 'https://media.example.com/media/one/bussola-chat.png',
  preview: {
    src: 'https://media.example.com/media/one/bussola-chat.png',
    srcSet: null,
  },
  alts: [{ locale: 'it', alt: 'Chat di Bussola', reviewState: 'reviewed' }],
  missingAltLocales: ['en', 'fr', 'de'],
  usages: [],
}

export const CV_ENTRY: MediaEntry = {
  mediaId: 'media-cv' as Id<'media'>,
  fileName: 'cv-anders-planck.pdf',
  mime: 'application/pdf',
  kind: 'file',
  bytes: 90_000,
  widthPx: null,
  heightPx: null,
  uploadedAt: Date.UTC(2026, 10, 24),
  url: 'https://media.example.com/media/two/cv-anders-planck.pdf',
  preview: null,
  alts: [],
  missingAltLocales: [],
  usages: [
    { collection: 'profile', key: 'main', field: 'cvMediaId', state: 'live' },
  ],
}

/** The server's limits as `media.listMedia` returns them. */
export const MEDIA_LIMITS: MediaLibrary['limits'] = {
  acceptedMimes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxBytes: 10 * 1024 * 1024,
  maxAltLength: 300,
}
