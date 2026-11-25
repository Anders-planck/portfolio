import { expect, test } from '@playwright/test'

import { findBlock, openImmersiveDemo } from './immersive-stage.fixture'

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
  const box = await block.boundingBox()
  expect(box).not.toBeNull()
  if (box === null) {
    return
  }
  const centreX = box.x + box.width / 2
  const centreY = box.y + box.height / 2
  await page.mouse.move(centreX, centreY)
  await page.mouse.down()
  // About a quarter turn: the scroll pose (20°) plus the drag passes 45°.
  await page.mouse.move(centreX + 120, centreY, { steps: 8 })
  await expect(block.locator('[data-dragging]')).toHaveCount(1)
  await page.mouse.up()

  await expect(block.locator('[data-dragging]')).toHaveCount(0)
  await expect(block).toHaveAttribute('aria-valuetext', '04 · Quarta faccia')
})
