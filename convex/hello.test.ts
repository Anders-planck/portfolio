/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

test('hello.get returns the greeting', async () => {
  const backend = convexTest(schema, modules)
  const result = await backend.query(api.hello.get, {})
  expect(result).toEqual({ message: 'Ciao da Convex' })
})
