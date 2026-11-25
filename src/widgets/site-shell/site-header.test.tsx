// @vitest-environment happy-dom
import { QueryClient } from '@tanstack/react-query'
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { publishedCvQueryOptions } from '../../entities/media/published-cv-query-options'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { SiteHeader } from './site-header'

afterEach(cleanup)

const CV_URL = 'https://media.example.com/media/cv/cv-anders-planck.pdf'

/** The header at `path`, with the CV query as the shell loader leaves it. */
function renderHeaderAt(path: string, cvUrl: string | null) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(
    publishedCvQueryOptions().queryKey,
    cvUrl === null ? null : { url: cvUrl, fileName: 'cv-anders-planck.pdf' },
  )
  return renderAtPath(<SiteHeader />, path, queryClient)
}

test('the sections link in the locale of the page, the current one marked', async () => {
  renderHeaderAt('/en/lavori/bussola', CV_URL)
  const work = await screen.findByRole('link', { name: 'Work' })
  expect(work.getAttribute('href')).toBe('/en/lavori')
  expect(work.getAttribute('aria-current')).toBe('page')
  expect(
    screen.getByRole('link', { name: 'Notes' }).getAttribute('aria-current'),
  ).toBeNull()
  expect(
    screen.getByRole('link', { name: 'anders/planck' }).getAttribute('href'),
  ).toBe('/en')
  expect(
    screen.getByRole('link', { name: 'CV · PDF' }).getAttribute('href'),
  ).toBe(CV_URL)
})

test('before a CV is published the header has no CV button', async () => {
  renderHeaderAt('/en', null)
  expect(await screen.findByRole('link', { name: 'Work' })).toBeDefined()
  expect(screen.queryByRole('link', { name: 'CV · PDF' })).toBeNull()
})
