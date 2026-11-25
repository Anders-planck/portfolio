import { expect, test } from '@playwright/test'

import {
  findBlock,
  openImmersiveDemo,
  readBlockCentre,
} from './immersive-stage.fixture'

test('the arrow keys turn the focused Block a face at a time', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  const block = findBlock(page)
  await expect(block).toHaveAttribute('aria-valuetext', '01 · Prima faccia')

  await block.focus()
  await page.keyboard.press('ArrowRight')
  await expect(block).toHaveAttribute('aria-valuetext', '02 · Seconda faccia')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(block).toHaveAttribute('aria-valuetext', '04 · Quarta faccia')
  // The arrows turned the Block, not the page.
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test('a drag turns the Block and it snaps to a face on release', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  const block = findBlock(page)
  const centre = await readBlockCentre(page)
  await page.mouse.move(centre.left, centre.top)
  await page.mouse.down()
  // About a quarter turn: the scroll pose (20°) plus the drag passes 45°.
  await page.mouse.move(centre.left + 120, centre.top, { steps: 8 })
  await expect(block.locator('[data-dragging]')).toHaveCount(1)
  await page.mouse.up()

  await expect(block.locator('[data-dragging]')).toHaveCount(0)
  await expect(block).toHaveAttribute('aria-valuetext', '04 · Quarta faccia')
})

test('a click without movement is not a drag', async ({ page }) => {
  await openImmersiveDemo(page)
  const block = findBlock(page)
  const centre = await readBlockCentre(page)
  await page.mouse.move(centre.left, centre.top)
  await page.mouse.down()
  await expect(block.locator('[data-dragging]')).toHaveCount(0)
  await page.mouse.up()
  await expect(block).toHaveAttribute('aria-valuetext', '01 · Prima faccia')
})

test('arrows with a modifier key are left to the browser; Home and End pick the ends', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  const block = findBlock(page)
  await block.focus()
  await page.keyboard.press('Shift+ArrowRight')
  await page.keyboard.press('Control+ArrowLeft')
  await expect(block).toHaveAttribute('aria-valuetext', '01 · Prima faccia')

  await page.keyboard.press('End')
  await expect(block).toHaveAttribute('aria-valuetext', '04 · Quarta faccia')
  await page.keyboard.press('Home')
  await expect(block).toHaveAttribute('aria-valuetext', '01 · Prima faccia')
})
