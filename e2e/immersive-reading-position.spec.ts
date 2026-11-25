import { expect, test } from '@playwright/test'

import {
  DEMO_PATH,
  findActiveStep,
  findBlock,
  findChapterIndex,
  openImmersiveDemo,
  WIDE,
} from './immersive-stage.fixture'

declare global {
  interface Window {
    cumulativeLayoutShift: number
  }
}

test('a reload in the middle of the page, without an anchor, stays on that chapter', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  await page.mouse.wheel(0, 2400)
  await expect(findActiveStep(page)).not.toContainText('Apertura')
  const activeChapter = await findActiveStep(page).textContent()
  expect(page.url()).not.toContain('#')

  await page.reload()
  await expect(findBlock(page)).toBeVisible()
  await expect(findActiveStep(page)).toHaveText(activeChapter ?? '')
})

test('crossing 1024px keeps the reader on the chapter they were reading', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  await findChapterIndex(page)
    .getByRole('button', { name: /Ancore/ })
    .click()
  await expect(findActiveStep(page)).toContainText('Ancore')
  // Scrolling on past the anchor: the address keeps a stale #ancore.
  await page.mouse.wheel(0, 400)
  const heading = page.getByRole('heading', {
    name: 'Ogni capitolo ha un indirizzo',
  })

  await page.setViewportSize({ width: 900, height: 720 })
  await expect(heading).toBeInViewport()
  await page.setViewportSize(WIDE)
  await expect(findActiveStep(page)).toContainText('Ancore')
})

test('the first load of the immersive layout does not shift (CLS < 0.1)', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.cumulativeLayoutShift = 0
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const shift = entry as PerformanceEntry & {
          value: number
          hadRecentInput: boolean
        }
        if (!shift.hadRecentInput) {
          window.cumulativeLayoutShift += shift.value
        }
      })
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.setViewportSize(WIDE)
  await page.goto(DEMO_PATH)
  await expect(findBlock(page)).toBeVisible()
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => window.cumulativeLayoutShift)).toBeLessThan(
    0.1,
  )
})
