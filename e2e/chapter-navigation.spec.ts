import { expect, test } from '@playwright/test'

import { findActiveStep, openImmersiveDemo } from './immersive-stage.fixture'

test('two quick clicks on next go two chapters on', async ({ page }) => {
  await openImmersiveDemo(page)
  const next = page
    .getByRole('group', { name: 'Capitolo' })
    .getByRole('button', { name: 'Capitolo successivo' })
  await next.click()
  await next.click()
  await expect(findActiveStep(page)).toContainText('Puntatore')
})

test('a chapter is announced after ‹ ›, not while scrolling', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  const announcement = page.locator('[aria-live]:not(:empty)')
  await page.mouse.wheel(0, 1400)
  await expect(findActiveStep(page)).not.toContainText('Apertura')
  await expect(announcement).toHaveCount(0)

  await page
    .getByRole('group', { name: 'Capitolo' })
    .getByRole('button', { name: 'Capitolo precedente' })
    .click()
  await expect(announcement).toHaveCount(1)
})
