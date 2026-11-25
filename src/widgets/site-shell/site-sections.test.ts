import { expect, test } from 'vitest'

import { isInSection } from './site-sections'

test.each([
  ['/lavori', true],
  ['/lavori/bussola', true],
  ['/lavori-vecchi', false],
  ['/note', false],
  ['/', false],
])('%s is in Lavori: %s', (pathname, isInWork) => {
  expect(isInSection(pathname, '/lavori')).toBe(isInWork)
})
