import { expect, type Page, test } from '@playwright/test'

import {
  findBlock,
  openImmersiveDemo,
  readBlockCentre,
} from './immersive-stage.fixture'

declare global {
  interface Window {
    reactCommitCount: number
  }
}

/**
 * Counts React commits through the DevTools hook React calls on every
 * commit, in production builds too, so the app carries no test code.
 */
async function countReactCommits(page: Page) {
  await page.addInitScript(() => {
    window.reactCommitCount = 0
    Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
      value: {
        isDisabled: false,
        supportsFiber: true,
        renderers: new Map(),
        inject: () => 1,
        checkDCE: () => undefined,
        onScheduleFiberRoot: () => undefined,
        onCommitFiberUnmount: () => undefined,
        onPostCommitFiberRoot: () => undefined,
        onCommitFiberRoot: () => {
          window.reactCommitCount += 1
        },
      },
    })
  })
}

function readCommitCount(page: Page) {
  return page.evaluate(() => window.reactCommitCount)
}

/** Lets a frame pass, so rAF work runs between two inputs. */
function waitForFrame(page: Page) {
  return page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve()
        })
      }),
  )
}

const FRAME_COUNT = 40

test('the Block follows the pointer without a React render', async ({
  page,
}) => {
  await countReactCommits(page)
  await openImmersiveDemo(page)
  expect(await readCommitCount(page)).toBeGreaterThan(0)
  const centre = await readBlockCentre(page)
  const before = await readCommitCount(page)
  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    await page.mouse.move(centre.left + frame * 4, centre.top + frame * 3)
    await waitForFrame(page)
  }
  expect(await readCommitCount(page)).toBe(before)
})

test('scrolling turns the Block with a render per chapter, not per frame', async ({
  page,
}) => {
  await countReactCommits(page)
  await openImmersiveDemo(page)
  const transformBefore = await findBlock(page)
    .locator(':scope > *')
    .evaluate((element) =>
      element instanceof HTMLElement ? element.style.transform : '',
    )
  const before = await readCommitCount(page)
  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    await page.mouse.wheel(0, 60)
    await waitForFrame(page)
  }
  const transformAfter = await findBlock(page)
    .locator(':scope > *')
    .evaluate((element) =>
      element instanceof HTMLElement ? element.style.transform : '',
    )
  expect(transformAfter).not.toBe(transformBefore)
  // A few chapters crossed and faces turned to the front, far below 40.
  expect((await readCommitCount(page)) - before).toBeLessThanOrEqual(8)
})
