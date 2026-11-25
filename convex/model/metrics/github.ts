import { z } from 'zod'

import type { SourceReading } from './attempts'
import { fetchJson, type JsonResponse } from './http'
import type { Source } from './sources'

const GITHUB_API_URL = 'https://api.github.com'
const PAGE_SIZE = 100
/** Ten pages of contributors: past that, the total is not trusted. */
const MAX_CONTRIBUTOR_PAGES = 10

const contributorsSchema = z.array(
  z.object({
    // Anonymous contributors have no login; they still count in the total.
    login: z.string().optional(),
    contributions: z.number().int().nonnegative(),
  }),
)
type Contributor = z.infer<typeof contributorsSchema>[number]

const searchSchema = z.object({
  total_count: z.number().int().nonnegative(),
  incomplete_results: z.boolean(),
})

type GithubSource = Extract<
  Source,
  { kind: 'github-commits' | 'github-search' }
>
type RepoCommits = { authored: number; total: number } | null

function toGithubHeaders(token: string | null): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    // GitHub refuses requests without a User-Agent.
    'User-Agent': 'portfolio-metrics',
    ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
  }
}

async function readContributorPages(
  repo: string,
  headers: Record<string, string>,
): Promise<JsonResponse<Contributor[]>> {
  const contributors: Contributor[] = []
  for (let page = 1; page <= MAX_CONTRIBUTOR_PAGES; page += 1) {
    const response = await fetchJson(
      `${GITHUB_API_URL}/repos/${repo}/contributors?per_page=${String(PAGE_SIZE)}&page=${String(page)}`,
      headers,
      contributorsSchema,
    )
    if (response.kind === 'failed') {
      return response
    }
    contributors.push(...response.body)
    if (response.body.length < PAGE_SIZE) {
      return { kind: 'ok', body: contributors }
    }
  }
  return { kind: 'failed', reason: { kind: 'incomplete' } }
}

function countRepoCommits(
  contributors: Contributor[],
  login: string,
): RepoCommits {
  const author = contributors.find(
    (contributor) => contributor.login?.toLowerCase() === login.toLowerCase(),
  )
  if (author === undefined) {
    return null
  }
  const total = contributors.reduce(
    (sum, contributor) => sum + contributor.contributions,
    0,
  )
  return { authored: author.contributions, total }
}

async function readCommits(
  source: Extract<Source, { kind: 'github-commits' }>,
  headers: Record<string, string>,
): Promise<SourceReading> {
  const perRepo: { authored: number; total: number }[] = []
  // One repository at a time: the first failure stops the read.
  for (const repo of source.repos) {
    const response = await readContributorPages(repo, headers)
    if (response.kind === 'failed') {
      return response
    }
    const commits = countRepoCommits(response.body, source.login)
    if (commits === null) {
      return { kind: 'failed', reason: { kind: 'author-not-found' } }
    }
    perRepo.push(commits)
  }
  const figure = perRepo.reduce(
    (sum, commits) => ({
      value: sum.value + commits.authored,
      total: sum.total + commits.total,
    }),
    { value: 0, total: 0 },
  )
  return { kind: 'ok', figure }
}

async function readSearchCount(
  source: Extract<Source, { kind: 'github-search' }>,
  headers: Record<string, string>,
): Promise<SourceReading> {
  const params = new URLSearchParams([
    ['q', source.query],
    ['per_page', '1'],
  ])
  const response = await fetchJson(
    `${GITHUB_API_URL}/search/issues?${params.toString()}`,
    headers,
    searchSchema,
  )
  if (response.kind === 'failed') {
    return response
  }
  if (response.body.incomplete_results) {
    return { kind: 'failed', reason: { kind: 'incomplete' } }
  }
  return {
    kind: 'ok',
    figure: { value: response.body.total_count, total: null },
  }
}

/**
 * Reads a GitHub source. A private one (`needsToken`) is never read without
 * the token: GitHub would answer with only the public part, a wrong figure.
 */
export async function readGithubSource(
  source: GithubSource,
  token: string | null,
): Promise<SourceReading> {
  if (source.needsToken && token === null) {
    return { kind: 'failed', reason: { kind: 'missing-token' } }
  }
  const headers = toGithubHeaders(token)
  switch (source.kind) {
    case 'github-commits': {
      return readCommits(source, headers)
    }
    case 'github-search': {
      return readSearchCount(source, headers)
    }
  }
}
