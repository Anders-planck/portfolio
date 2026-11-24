import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('hello page is server-rendered from Convex', async ({ request }) => {
  const response = await request.get('/')
  expect(response.ok()).toBe(true)
  expect(await response.text()).toContain('Ciao da Convex')
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
