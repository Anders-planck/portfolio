import { describe, expect, it } from 'vitest'
import {
  getFeaturedProjects,
  getProjectBySlug,
  projects
} from '#/data/projects'

describe('projects', () => {
  it('has exactly 5 projects', () => {
    expect(projects).toHaveLength(5)
  })

  it('each project has required fields', () => {
    for (const p of projects) {
      expect(p.slug).toBeTruthy()
      expect(p.title).toBeTruthy()
      expect(p.tags.length).toBeGreaterThan(0)
      expect(p.results.length).toBeGreaterThan(0)
    }
  })

  it('getProjectBySlug returns correct project', () => {
    const p = getProjectBySlug('open-banking-ui')
    expect(p?.title).toBe('Open Banking UI')
  })

  it('getProjectBySlug returns undefined for unknown slug', () => {
    expect(getProjectBySlug('nope')).toBeUndefined()
  })

  it('getFeaturedProjects returns first 3', () => {
    expect(getFeaturedProjects()).toHaveLength(3)
  })
})
