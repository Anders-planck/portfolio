import { describe, expect, test } from 'vitest'

import { isLoopbackDeploymentUrl } from './loopback'

describe('isLoopbackDeploymentUrl', () => {
  test.each([
    'http://127.0.0.1:3210',
    'http://localhost:3210',
    'http://[::1]:3210',
  ])('accepts the local backend at %s', (deploymentUrl) => {
    expect(isLoopbackDeploymentUrl(deploymentUrl)).toBe(true)
  })

  test.each([
    'https://happy-otter-123.convex.cloud',
    'https://api.example.com',
    'https://127.0.0.1:3210',
    'http://127.0.0.1.example.com',
    'http://localhost.example.com',
    'not a url',
    '',
  ])('refuses %s', (deploymentUrl) => {
    expect(isLoopbackDeploymentUrl(deploymentUrl)).toBe(false)
  })

  test('refuses a deployment without a URL', () => {
    expect(isLoopbackDeploymentUrl(undefined)).toBe(false)
  })
})
