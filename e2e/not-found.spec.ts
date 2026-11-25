import { expect, test } from '@playwright/test'

test('an unknown address answers 404 with the page in Italian', async ({
  page,
}) => {
  const response = await page.goto('/pagina-che-non-esiste')
  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Questa pagina non esiste, o non più.',
    }),
  ).toBeVisible()
  await expect(page).toHaveTitle('Pagina non trovata · Anders Planck')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex',
  )
})

test('the 404 page speaks the locale of the address and links back in it', async ({
  page,
}) => {
  const response = await page.goto('/en/no-such-page')
  expect(response?.status()).toBe(404)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle('Page not found · Anders Planck')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'This page does not exist, or not anymore.',
    }),
  ).toBeVisible()

  await page
    .getByRole('main')
    .getByRole('link', { name: 'See the work' })
    .click()
  await expect(page).toHaveURL(/\/en\/lavori$/)

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Back to home' })
    .click()
  await expect(page).toHaveURL(/\/en$/)
  await expect(page).toHaveTitle('Anders Planck')
})
