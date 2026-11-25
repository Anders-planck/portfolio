import { expect, test } from 'vitest'

import type { Id } from '../../_generated/dataModel'
import type { RuleMedia } from '../media/rulemedia'
import { altRule } from './altrule'
import type { Locale } from './locales'
import { EMPTY_PROFILE_CONTENT_FIELDS, EMPTY_PROFILE_FIELDS } from './profile'
import type { Snapshot } from './snapshot'

const MEDIA_ID = 'media-one' as Id<'media'>

/** A profile with content in `locales` that points at `MEDIA_ID`. */
function toSnapshotPointingAtMedia(locales: Locale[]): Snapshot {
  return {
    collection: 'profile',
    key: 'main',
    fields: { ...EMPTY_PROFILE_FIELDS, cvMediaId: MEDIA_ID },
    content: locales.map((locale) => ({
      ...EMPTY_PROFILE_CONTENT_FIELDS,
      locale,
    })),
  }
}

function toContext(media: RuleMedia | null) {
  return {
    metricKeys: new Set<string>(),
    media: new Map(media === null ? [] : [[MEDIA_ID, media]]),
  }
}

const IMAGE_WITH_IT_ALT: RuleMedia = {
  kind: 'image',
  fileName: 'bussola-chat.png',
  altLocales: new Set(['it']),
}

test('an image with alt in every locale of the document passes', () => {
  expect(
    altRule(toSnapshotPointingAtMedia(['it']), toContext(IMAGE_WITH_IT_ALT)),
  ).toEqual([])
})

test('an image without alt in a locale of the document blocks for that locale', () => {
  expect(
    altRule(
      toSnapshotPointingAtMedia(['it', 'en']),
      toContext(IMAGE_WITH_IT_ALT),
    ),
  ).toEqual([
    {
      rule: 'missing-alt',
      severity: 'block',
      field: 'cvMediaId',
      locale: 'en',
      message: '"bussola-chat.png" has no alt text in this locale',
    },
  ])
})

test('a file needs no alt text', () => {
  const pdf: RuleMedia = {
    kind: 'file',
    fileName: 'cv.pdf',
    altLocales: new Set(),
  }

  expect(
    altRule(toSnapshotPointingAtMedia(['it', 'en']), toContext(pdf)),
  ).toEqual([])
})

test('a reference to media that does not exist blocks', () => {
  expect(
    altRule(toSnapshotPointingAtMedia(['it']), toContext(null)),
  ).toMatchObject([
    { rule: 'missing-media', severity: 'block', field: 'cvMediaId' },
  ])
})

test('a document without media has no findings', () => {
  const snapshot: Snapshot = {
    ...toSnapshotPointingAtMedia(['it']),
    fields: EMPTY_PROFILE_FIELDS,
  }

  expect(altRule(snapshot, toContext(null))).toEqual([])
})
