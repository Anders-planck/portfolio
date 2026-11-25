import { expect, test } from 'vitest'

import { isCmsPathname } from './is-cms-pathname'

test('the CMS and its screens are CMS addresses', () => {
  expect(isCmsPathname('/cms')).toBe(true)
  expect(isCmsPathname('/cms/profilo')).toBe(true)
})

test('site pages are not, even when they start with the same letters', () => {
  expect(isCmsPathname('/')).toBe(false)
  expect(isCmsPathname('/cmsx')).toBe(false)
  expect(isCmsPathname('/en/cms')).toBe(false)
})
