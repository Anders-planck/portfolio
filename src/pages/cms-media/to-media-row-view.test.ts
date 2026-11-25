import { expect, test } from 'vitest'

import { CV_ENTRY, SCREENSHOT_ENTRY } from '../../entities/media/media.fixture'
import { toMediaRowViewFromEntry } from './to-media-row-view'

test('an image shows its size and pixels, a file only its size', () => {
  expect(toMediaRowViewFromEntry(SCREENSHOT_ENTRY).details).toBe(
    '240 kB · 1440 × 900',
  )
  expect(toMediaRowViewFromEntry(CV_ENTRY).details).toBe('90 kB')
})

test('each usage names the document, the field and whether it is live', () => {
  expect(toMediaRowViewFromEntry(CV_ENTRY).usages).toEqual([
    'Profilo · CV · pubblicato',
  ])
})

test('an image lists the locales its alt text is missing in', () => {
  expect(toMediaRowViewFromEntry(SCREENSHOT_ENTRY).altStatus).toEqual({
    tone: 'error',
    label: 'manca: EN, FR, DE',
  })
})

test('alt in every locale is complete, unless some is still to review', () => {
  const alts = (['it', 'en', 'fr', 'de'] as const).map((locale) => ({
    locale,
    alt: 'Chat',
    reviewState: 'reviewed' as const,
  }))

  expect(
    toMediaRowViewFromEntry({ ...SCREENSHOT_ENTRY, alts }).altStatus,
  ).toEqual({ tone: 'success', label: 'completo' })
  expect(
    toMediaRowViewFromEntry({
      ...SCREENSHOT_ENTRY,
      alts: alts.map((record) =>
        record.locale === 'fr'
          ? { ...record, reviewState: 'to-review' as const }
          : record,
      ),
    }).altStatus,
  ).toEqual({ tone: 'warning', label: 'da rivedere: FR' })
})

test('a file needs no alt text', () => {
  expect(toMediaRowViewFromEntry(CV_ENTRY).altStatus).toEqual({
    tone: 'neutral',
    label: 'non serve',
  })
})
