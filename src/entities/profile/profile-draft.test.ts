import { describe, expect, test } from 'vitest'

import { toDraftEditFromProfileEdit } from './profile-draft'

describe('toDraftEditFromProfileEdit', () => {
  test('locale content becomes the locale edit of the Profile document', () => {
    expect(
      toDraftEditFromProfileEdit(
        { fields: { email: 'a@example.com' }, content: { subtitle: 'Hi' } },
        'en',
      ),
    ).toEqual({
      collection: 'profile',
      key: 'main',
      fields: { email: 'a@example.com' },
      localeEdit: { locale: 'en', content: { subtitle: 'Hi' } },
    })
  })

  test('an edit of shared fields only has no locale edit', () => {
    expect(
      toDraftEditFromProfileEdit({ fields: { name: 'Anders' } }, 'it'),
    ).toEqual({
      collection: 'profile',
      key: 'main',
      fields: { name: 'Anders' },
    })
  })
})
