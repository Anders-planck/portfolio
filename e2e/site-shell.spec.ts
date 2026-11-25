import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const WIDE = { width: 1280, height: 720 }
const NARROW = { width: 390, height: 844 }

for (const [layout, viewport] of [
  ['wide', WIDE],
  ['narrow', NARROW],
] as const) {
  for (const path of ['/', '/en', '/fr/pagina-che-non-esiste']) {
    test(`${path} has no axe violations in the ${layout} layout`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto(path)
      await expect(page.getByRole('banner')).toBeVisible()
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  }
}

test('the header marks the section on screen with aria-current', async ({
  page,
}) => {
  await page.setViewportSize(WIDE)
  await page.goto('/lavori/bussola')
  const navigation = page.getByRole('navigation', {
    name: 'Navigazione principale',
  })
  await expect(
    navigation.getByRole('link', { name: 'Lavori' }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(
    navigation.getByRole('link', { name: 'Note' }),
  ).not.toHaveAttribute('aria-current')
})

test('under 1024px the sections move into the menu', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 720 })
  await page.goto('/en')
  const banner = page.getByRole('banner')
  await expect(banner.getByRole('link', { name: 'Work' })).toBeHidden()
  await banner.getByRole('button', { name: /menu|navigation/i }).click()
  await expect(
    page.getByRole('dialog').getByRole('link', { name: 'Work' }),
  ).toBeVisible()
})

test('a page is server-rendered with canonical, hreflang and Open Graph', async ({
  request,
}) => {
  const html = await (await request.get('/fr')).text()
  const head = html.slice(0, html.indexOf('</head>'))
  expect(head).toContain('<html lang="fr"')
  expect(head).toMatch(
    /<link rel="canonical" href="http:\/\/localhost:\d+\/fr"/,
  )
  for (const [hrefLang, path] of [
    ['it', '/'],
    ['en', '/en'],
    ['fr', '/fr'],
    ['de', '/de'],
    ['x-default', '/'],
  ] as const) {
    expect(head).toMatch(
      new RegExp(
        `<link rel="alternate" hrefLang="${hrefLang}" href="http://localhost:\\d+${path}"`,
        'i',
      ),
    )
  }
  expect(head).toContain('<meta property="og:locale" content="fr_FR"')
  expect(head).toContain(
    '<meta name="description" content="Frontend et full-stack en TypeScript."',
  )
})
