import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// The Convex webServer runs `seed:profile`, which publishes the profile once.

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
  await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/Anders-planck',
  )

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
