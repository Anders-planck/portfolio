import { describe, expect, test } from 'vitest'

import { mergeDraftEdits } from './merge-draft-edits'

interface Fields {
  name: string
  isAvailable: boolean
}

interface Content {
  subtitle: string
  titleLine1: string
}

describe('mergeDraftEdits', () => {
  test('a later edit of the same field wins; other fields are kept', () => {
    const merged = mergeDraftEdits<Fields, Content>(
      { content: { subtitle: 'Prima', titleLine1: 'Software' } },
      { content: { subtitle: 'Dopo' } },
    )

    expect(merged).toEqual({
      content: { subtitle: 'Dopo', titleLine1: 'Software' },
    })
  })

  test('shared fields and locale content merge side by side', () => {
    expect(
      mergeDraftEdits<Fields, Content>(
        { fields: { name: 'Anders' } },
        { content: { subtitle: 'Ciao' } },
      ),
    ).toEqual({ fields: { name: 'Anders' }, content: { subtitle: 'Ciao' } })
  })

  test('a shared-field edit adds no locale content', () => {
    expect(
      mergeDraftEdits<Fields, Content>(null, { fields: { isAvailable: true } }),
    ).toEqual({
      fields: { isAvailable: true },
    })
  })
})
