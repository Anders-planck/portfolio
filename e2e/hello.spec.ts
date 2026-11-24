import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('hello page is server-rendered from Convex', async ({ request }) => {
  const response = await request.get('/')
  expect(response.ok()).toBe(true)
  expect(await response.text()).toContain('Ciao da Convex')
})

test('SSR head links globals.css first, then the portfolio theme', async ({
  request,
}) => {
  const html = await (await request.get('/')).text()
  const head = html.slice(0, html.indexOf('</head>'))
  const hrefs = [
    ...head.matchAll(/<link rel="stylesheet" href="([^"]+)"/g),
  ].map((match) => match[1])

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

test('hello page shows the greeting and has no axe violations', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Ciao da Convex' }),
  ).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
