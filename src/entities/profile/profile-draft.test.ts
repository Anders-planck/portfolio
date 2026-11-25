import { describe, expect, test } from 'vitest'

import { mergeProfileEdits, toDraftEditFromProfileEdit } from './profile-draft'

describe('mergeProfileEdits', () => {
  test('a later edit of the same field wins; other fields are kept', () => {
    const merged = mergeProfileEdits(
      { content: { subtitle: 'Prima', titleLine1: 'Software' } },
      { content: { subtitle: 'Dopo' } },
    )

    expect(merged).toEqual({
      content: { subtitle: 'Dopo', titleLine1: 'Software' },
    })
  })

  test('shared fields and locale content merge side by side', () => {
    expect(
      mergeProfileEdits(
        { fields: { name: 'Anders' } },
        { content: { subtitle: 'Ciao' } },
      ),
    ).toEqual({ fields: { name: 'Anders' }, content: { subtitle: 'Ciao' } })
  })

  test('a shared-field edit adds no locale content', () => {
    expect(mergeProfileEdits(null, { fields: { isAvailable: true } })).toEqual({
      fields: { isAvailable: true },
    })
  })
})

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
