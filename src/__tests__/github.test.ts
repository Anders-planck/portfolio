import { describe, expect, it } from 'vitest'
import type { GitHubData } from '#/lib/github'
import { GITHUB_FALLBACK } from '#/lib/github'

describe('github', () => {
  it('fallback data has correct structure', () => {
    const data: GitHubData = GITHUB_FALLBACK
    expect(data.contributions).toBeGreaterThan(0)
    expect(data.lastActive).toBeTruthy()
    expect(data.topLanguages.length).toBeGreaterThan(0)
    expect(data.publicRepos).toBeGreaterThan(0)
  })
})
