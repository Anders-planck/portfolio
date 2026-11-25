import { expect, test } from 'vitest'

import type { Id } from '../../_generated/dataModel'
import type { RuleMedia } from '../media/rulemedia'
import { EMPTY_NOTE_CONTENT_FIELDS, EMPTY_NOTE_FIELDS } from '../notes/fields'
import type { Locale } from './locales'
import { mediaRule } from './mediarule'
import { EMPTY_PROFILE_CONTENT_FIELDS, EMPTY_PROFILE_FIELDS } from './profile'
import type { Snapshot } from './snapshot'

const MEDIA_ID = 'media-one'

const SCREENSHOT: RuleMedia = {
  kind: 'image',
  fileName: 'bussola-chat.png',
  altLocales: new Set(['it']),
}
const CV_PDF: RuleMedia = {
  kind: 'file',
  fileName: 'cv.pdf',
  altLocales: new Set(),
}

/** A note whose body in each of `locales` shows `MEDIA_ID` as a figure. */
function toNoteWithFigure(locales: Locale[]): Snapshot {
  return {
    collection: 'note',
    key: 'figure-note',
    fields: EMPTY_NOTE_FIELDS,
    content: locales.map((locale) => ({
      ...EMPTY_NOTE_CONTENT_FIELDS,
      locale,
      body: `::figure[La chat]{media="${MEDIA_ID}"}`,
    })),
  }
}

/** A Profile with content in `locales` whose CV is `MEDIA_ID`. */
function toProfileWithCv(locales: Locale[]): Snapshot {
  return {
    collection: 'profile',
    key: 'main',
    fields: { ...EMPTY_PROFILE_FIELDS, cvMediaId: MEDIA_ID as Id<'media'> },
    content: locales.map((locale) => ({
      ...EMPTY_PROFILE_CONTENT_FIELDS,
      locale,
    })),
  }
}

function toContext(media: RuleMedia | null) {
  return {
    metricKeys: new Set<string>(),
    noteSlugClaims: [],
    noteCount: 0,
    media: new Map(media === null ? [] : [[MEDIA_ID, media]]),
  }
}

test('a figure with alt in its own locale passes', () => {
  expect(mediaRule(toNoteWithFigure(['it']), toContext(SCREENSHOT))).toEqual([])
})

test('a figure without alt in its locale blocks for that locale only', () => {
  expect(
    mediaRule(toNoteWithFigure(['it', 'en']), toContext(SCREENSHOT)),
  ).toEqual([
    {
      rule: 'missing-alt',
      severity: 'block',
      field: 'body',
      locale: 'en',
      message: '"bussola-chat.png" has no alt text in this locale',
    },
  ])
})

test('a PDF CV passes; an image as the CV blocks', () => {
  expect(mediaRule(toProfileWithCv(['it']), toContext(CV_PDF))).toEqual([])
  expect(
    mediaRule(toProfileWithCv(['it']), toContext(SCREENSHOT)),
  ).toMatchObject([
    { rule: 'wrong-media-kind', field: 'cvMediaId', locale: null },
  ])
})

test('a PDF as a figure blocks', () => {
  expect(mediaRule(toNoteWithFigure(['it']), toContext(CV_PDF))).toMatchObject([
    { rule: 'wrong-media-kind', field: 'body', locale: 'it' },
  ])
})

test('a reference to media that does not exist blocks', () => {
  expect(mediaRule(toNoteWithFigure(['it']), toContext(null))).toMatchObject([
    { rule: 'missing-media', severity: 'block', field: 'body', locale: 'it' },
  ])
})

test('a document without media has no findings', () => {
  const snapshot: Snapshot = {
    collection: 'profile',
    key: 'main',
    fields: EMPTY_PROFILE_FIELDS,
    content: [{ ...EMPTY_PROFILE_CONTENT_FIELDS, locale: 'it' }],
  }

  expect(mediaRule(snapshot, toContext(null))).toEqual([])
})
