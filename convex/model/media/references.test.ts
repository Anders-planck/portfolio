import { expect, test } from 'vitest'

import type { Id } from '../../_generated/dataModel'
import { EMPTY_PROFILE_FIELDS, type ProfileFields } from '../content/profile'
import type { Snapshot } from '../content/snapshot'
import { EMPTY_NOTE_CONTENT_FIELDS, EMPTY_NOTE_FIELDS } from '../notes/fields'
import { findMediaReferences, listFigureMediaIds } from './references'

function toProfileSnapshot(fields: ProfileFields): Snapshot {
  return { collection: 'profile', key: 'main', fields, content: [] }
}

test('the Profile points at its CV, a shared field that must be a file', () => {
  const cvMediaId = 'media-cv' as Id<'media'>

  expect(
    findMediaReferences(
      toProfileSnapshot({ ...EMPTY_PROFILE_FIELDS, cvMediaId }),
    ),
  ).toEqual([
    {
      mediaId: cvMediaId,
      field: 'cvMediaId',
      locale: null,
      expectedKind: 'file',
    },
  ])
})

test('a Profile without a CV, or saved before the field existed, points at nothing', () => {
  const { name, email, links, isAvailable, skills } = EMPTY_PROFILE_FIELDS
  const fieldsBeforeCv = { name, email, links, isAvailable, skills }

  expect(findMediaReferences(toProfileSnapshot(EMPTY_PROFILE_FIELDS))).toEqual(
    [],
  )
  expect(findMediaReferences(toProfileSnapshot(fieldsBeforeCv))).toEqual([])
})

test('a note points at the image of each figure, in the locale of its body', () => {
  const snapshot: Snapshot = {
    collection: 'note',
    key: 'figure-note',
    fields: EMPTY_NOTE_FIELDS,
    content: [
      {
        ...EMPTY_NOTE_CONTENT_FIELDS,
        locale: 'it',
        body: 'Testo.\n\n::figure[Uno]{media="media-a"}\n\n::figure[Due]{media="media-b"}',
      },
      { ...EMPTY_NOTE_CONTENT_FIELDS, locale: 'en', body: 'No figure.' },
    ],
  }

  expect(findMediaReferences(snapshot)).toEqual([
    { mediaId: 'media-a', field: 'body', locale: 'it', expectedKind: 'image' },
    { mediaId: 'media-b', field: 'body', locale: 'it', expectedKind: 'image' },
  ])
})

test('figures inside code are not figures', () => {
  expect(
    listFigureMediaIds('```\n::figure[Uno]{media="media-a"}\n```'),
  ).toEqual([])
})
