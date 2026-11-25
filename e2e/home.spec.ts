import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// The Convex webServer runs `seed:publishSeedProfile`, which publishes the profile once.

test('Home is server-rendered from the published profile', async ({
  request,
}) => {
  const response = await request.get('/')
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('Software Engineer @ Madisoft · Ferrara')
  expect(html).toContain('Frontend e full-stack in TypeScript.')
})

test('SSR head links globals.css first, then the portfolio theme', async ({
  request,
}) => {
  const html = await (await request.get('/')).text()
  const head = html.slice(0, html.indexOf('</head>'))
  const hrefs = [
    ...head.matchAll(/<link rel="stylesheet" href="([^"]+)"/g),
  ].flatMap((match) => match[1] ?? [])

  // globals.css declares the cascade-layer order, so it must come first.
  expect(hrefs[0]).toMatch(/\/assets\/globals-[^/]+\.css$/)

  const sheets = await Promise.all(
    hrefs.map(async (href) => (await request.get(href)).text()),
  )
  const themeIndex = sheets.findIndex((css) =>
    css.includes('data-astryx-theme=portfolio'),
  )
  expect(themeIndex).toBeGreaterThan(0)
})

test('Home shows the published profile and has no axe violations', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Software Engineer.' }),
  ).toBeVisible()
  await expect(
    page.getByRole('main').getByRole('link', { name: 'GitHub' }),
  ).toHaveAttribute('href', 'https://github.com/Anders-planck')

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('an untranslated locale shows the Italian profile with a notice', async ({
  page,
}) => {
  // The seed publishes Italian only, so English falls back to it.
  await page.goto('/en')
  await expect(
    page.getByText(
      'This page is not translated yet: you are reading it in Italiano.',
    ),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Software Engineer.' }),
  ).toBeVisible()
})

test('the footer carries the published contacts', async ({ page }) => {
  await page.goto('/de')
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: 'GitHub' }),
  ).toHaveAttribute('href', 'https://github.com/Anders-planck')
})
