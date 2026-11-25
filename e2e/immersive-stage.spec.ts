import { expect, test } from '@playwright/test'

import {
  DEMO_PATH,
  findActiveStep,
  findChapterIndex,
  openImmersiveDemo,
} from './immersive-stage.fixture'

test('Page Down, Space and the arrows move through chapters without a click', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  await expect(findActiveStep(page)).toContainText('Apertura')

  await page.keyboard.press('PageDown')
  await page.keyboard.press('PageDown')
  await expect(findActiveStep(page)).not.toContainText('Apertura')

  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowDown')
  await expect(findActiveStep(page)).toContainText('Puntatore')

  await page.keyboard.press('End')
  await expect(findActiveStep(page)).toContainText('Impaginazione')
  await page.keyboard.press('PageUp')
  await page.keyboard.press('ArrowUp')
  await expect(findActiveStep(page)).toContainText('Ancore')
})

test('the chapter index goes to a chapter and puts its anchor in the address', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  await findChapterIndex(page)
    .getByRole('button', { name: /Puntatore/ })
    .click()
  await expect(findActiveStep(page)).toContainText('Puntatore')
  await expect(page).toHaveURL(/#puntatore$/)
  await expect(
    page.getByRole('heading', { name: 'Il blocco segue il puntatore' }),
  ).toBeInViewport()
})

test('the chapter navigation shares the eyebrow numbers and steps both ways', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  const navigation = page.getByRole('group', { name: 'Capitolo' })
  await expect(navigation).toContainText('00 / 04 · Apertura')

  await navigation.getByRole('button', { name: 'Capitolo successivo' }).click()
  await expect(navigation).toContainText('01 / 04 · Scorrimento')
  await expect(page.getByText('01 / Scorrimento')).toBeInViewport()

  await navigation.getByRole('button', { name: 'Capitolo precedente' }).click()
  await expect(navigation).toContainText('00 / 04 · Apertura')
})

test('a #chapter link opens the page on that chapter', async ({ page }) => {
  await openImmersiveDemo(page, `${DEMO_PATH}#ancore`)
  await expect(findActiveStep(page)).toContainText('Ancore')
  await expect(
    page.getByRole('heading', { name: 'Ogni capitolo ha un indirizzo' }),
  ).toBeInViewport()
})

test('Back returns to the same scroll position and chapter', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  await page.mouse.wheel(0, 2000)
  await expect(findActiveStep(page)).not.toContainText('Apertura')
  const scrollY = await page.evaluate(() => window.scrollY)
  const activeChapter = await findActiveStep(page).textContent()

  await page.getByRole('banner').getByRole('link', { name: 'Lavori' }).click()
  await expect(page).not.toHaveURL(/\/demo/)
  await page.goBack()

  await expect(findActiveStep(page)).toHaveText(activeChapter ?? '')
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeCloseTo(scrollY, -1)
})

test('the demo is kept out of search results', async ({ page }) => {
  await page.goto(DEMO_PATH)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex',
  )
})
