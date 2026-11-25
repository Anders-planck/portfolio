import { expect, test } from 'vitest'

import { isSameSecret } from './secret'

test('the same secret matches', () => {
  expect(isSameSecret('local-e2e-secret', 'local-e2e-secret')).toBe(true)
})

test('a secret that differs anywhere, or in length, does not', () => {
  expect(isSameSecret('local-e2e-secreT', 'local-e2e-secret')).toBe(false)
  expect(isSameSecret('Local-e2e-secret', 'local-e2e-secret')).toBe(false)
  expect(isSameSecret('local-e2e-secret!', 'local-e2e-secret')).toBe(false)
  expect(isSameSecret('', 'local-e2e-secret')).toBe(false)
})
