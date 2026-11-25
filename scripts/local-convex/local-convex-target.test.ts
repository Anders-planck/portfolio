import { describe, expect, test } from 'vitest'

import {
  chooseLocalConvexStep,
  readLinkedDeployment,
  toLocalCliEnvironment,
} from './local-convex-target'

const NOTHING_SET = {
  deployKey: undefined,
  environmentDeployment: undefined,
  linkedDeployment: null,
}

describe('chooseLocalConvexStep', () => {
  test('an anonymous local backend linked in .env.local gets its env set', () => {
    expect(
      chooseLocalConvexStep({
        ...NOTHING_SET,
        linkedDeployment: 'anonymous:anonymous-agent',
      }),
    ).toEqual({ kind: 'set-env' })
  })

  test('a fresh checkout creates a local backend first', () => {
    expect(chooseLocalConvexStep(NOTHING_SET)).toEqual({
      kind: 'create-local-backend',
    })
  })

  test('a deploy key in the environment is refused, whatever is linked', () => {
    expect(
      chooseLocalConvexStep({
        ...NOTHING_SET,
        deployKey: 'prod:happy-otter-123|secret',
        linkedDeployment: 'anonymous:anonymous-agent',
      }).kind,
    ).toBe('refuse')
  })

  test('a cloud deployment in the environment is refused', () => {
    expect(
      chooseLocalConvexStep({
        ...NOTHING_SET,
        environmentDeployment: 'dev:happy-otter-123',
        linkedDeployment: 'anonymous:anonymous-agent',
      }).kind,
    ).toBe('refuse')
  })

  test('a cloud deployment linked in .env.local is refused', () => {
    expect(
      chooseLocalConvexStep({
        ...NOTHING_SET,
        linkedDeployment: 'dev:happy-otter-123',
      }),
    ).toEqual({
      kind: 'refuse',
      reason: '.env.local links dev:happy-otter-123',
    })
  })
})

describe('toLocalCliEnvironment', () => {
  test('passes only the allowlist, in anonymous mode', () => {
    expect(
      toLocalCliEnvironment({
        PATH: '/usr/bin',
        HOME: '/home/ci',
        CONVEX_DEPLOY_KEY: 'prod:happy-otter-123|secret',
        CONVEX_DEPLOYMENT: 'dev:happy-otter-123',
        ANTHROPIC_API_KEY: 'sk-test',
      }),
    ).toEqual({
      PATH: '/usr/bin',
      HOME: '/home/ci',
      CONVEX_AGENT_MODE: 'anonymous',
    })
  })
})

describe('readLinkedDeployment', () => {
  test('reads the deployment, without quotes or a trailing comment', () => {
    expect(
      readLinkedDeployment(
        "# Deployment used by `npx convex dev`\nCONVEX_DEPLOYMENT='dev:happy-otter-123' # team: me\n",
      ),
    ).toBe('dev:happy-otter-123')
  })

  test('no file or no line links nothing', () => {
    expect(readLinkedDeployment(null)).toBeNull()
    expect(
      readLinkedDeployment('VITE_CONVEX_URL=http://127.0.0.1:3210'),
    ).toBeNull()
  })
})
