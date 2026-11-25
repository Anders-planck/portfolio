import { expect, test } from 'vitest'

import type { Id } from '../../_generated/dataModel'
import { EMPTY_PROFILE_FIELDS, type ProfileFields } from '../content/profile'
import type { Snapshot } from '../content/snapshot'
import { findMediaReferences } from './references'

function toProfileSnapshot(fields: ProfileFields): Snapshot {
  return { collection: 'profile', key: 'main', fields, content: [] }
}

test('the Profile points at its CV', () => {
  const cvMediaId = 'media-cv' as Id<'media'>

  expect(
    findMediaReferences(
      toProfileSnapshot({ ...EMPTY_PROFILE_FIELDS, cvMediaId }),
    ),
  ).toEqual([{ mediaId: cvMediaId, field: 'cvMediaId' }])
})

test('a Profile without a CV, or saved before the field existed, points at nothing', () => {
  const { name, email, links, isAvailable, skills } = EMPTY_PROFILE_FIELDS
  const fieldsBeforeCv = { name, email, links, isAvailable, skills }

  expect(findMediaReferences(toProfileSnapshot(EMPTY_PROFILE_FIELDS))).toEqual(
    [],
  )
  expect(findMediaReferences(toProfileSnapshot(fieldsBeforeCv))).toEqual([])
})
