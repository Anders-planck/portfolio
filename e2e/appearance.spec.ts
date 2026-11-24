import { execFileSync } from 'node:child_process'
import { expect, type Page, test } from '@playwright/test'
import type { Appearance } from '../convex/lib/appearance'

// Publishing changes global state, so these tests run one after another and
// put the defaults back at the end.
test.describe.configure({ mode: 'serial' })

const light: Appearance = {
  theme: {
    base: 16,
    ratio: 1.25,
    fonts: { body: 'Figtree', heading: 'Figtree', code: 'ui-monospace' },
    radiusMultiplier: 1,
    mode: 'light',
  },
  motion: { tempo: 1, character: 'standard' },
}

const dark: Appearance = {
  theme: {
    base: 20,
    ratio: 1.333,
    fonts: { body: 'Figtree', heading: 'Georgia', code: 'ui-monospace' },
    radiusMultiplier: 2,
    mode: 'dark',
  },
  motion: { tempo: 1.5, character: 'expressive' },
}

/** Publishes params on the running Convex backend: no rebuild, no restart. */
function publish(appearance: Appearance) {
  convex('siteSettings:setAppearance', JSON.stringify(appearance))
}

function convex(fn: string, args = '{}') {
  execFileSync('bunx', ['convex', 'run', fn, args], {
    env: { ...process.env, CONVEX_AGENT_MODE: 'anonymous' },
    stdio: 'pipe',
  })
}

test.afterAll(() => convex('siteSettings:resetAppearance'))

/** What the page draws with, read from the browser's computed styles. */
function rendered(page: Page) {
  return page.evaluate(() => {
    const scope = document.querySelector('body [data-astryx-theme]')
    const heading = document.querySelector('h1')
    if (scope === null || heading === null) {
      throw new Error('no theme scope or heading')
    }
    const tokens = getComputedStyle(scope)
    const h1 = getComputedStyle(heading)
    return {
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
      headingFont: h1.fontFamily.split(',')[0].replaceAll('"', ''),
      headingSize: h1.fontSize,
      radius: tokens.getPropertyValue('--radius-element').trim(),
      durationFast: tokens.getPropertyValue('--duration-fast').trim(),
      tempo: tokens.getPropertyValue('--_astryx-motion-tempo').trim(),
    }
  })
}

test('published params reach the server-rendered HTML', async ({ request }) => {
  publish(light)
  const before = await (await request.get('/')).text()
  expect(before).toMatch(/<html[^>]* data-theme="light"/)
  expect(before).toContain('--font-family-heading: Figtree, ')

  publish(dark)
  const after = await (await request.get('/')).text()
  expect(after).toMatch(/<html[^>]* data-theme="dark"/)
  expect(after).toContain('--font-family-heading: Georgia, ')
  expect(after).toContain('--_astryx-motion-tempo: 1.5;')
  // The params' stylesheet comes after the built theme's.
  const head = after.slice(0, after.indexOf('</head>'))
  expect(head.indexOf('<style data-appearance')).toBeGreaterThan(
    head.lastIndexOf('<link rel="stylesheet"'),
  )
})

test('the first paint already has the params, and hydration keeps them', async ({
  browser,
}) => {
  publish(dark)

  // Without JavaScript the page shows exactly what the server sent: if the
  // params are there, nothing changes them at hydration, so nothing flashes.
  const noJs = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await noJs.newPage()
  await staticPage.goto('/')
  const firstPaint = await rendered(staticPage)
  await noJs.close()
  expect(firstPaint).toEqual({
    colorScheme: 'dark',
    headingFont: 'Georgia',
    headingSize: firstPaint.headingSize,
    radius: '1.25rem',
    durationFast: '188ms',
    tempo: '1.5',
  })

  const context = await browser.newContext()
  const page = await context.newPage()
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  // <Theme> marks <html> with the scheme once React has hydrated.
  await expect(page.locator('html')).toHaveAttribute(
    'data-astryx-scheme',
    'dark',
  )
  expect(await rendered(page)).toEqual(firstPaint)
  expect(errors).toEqual([])
  await context.close()
})

test('a publish restyles an open page without a reload', async ({ page }) => {
  publish(dark)
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute(
    'data-astryx-scheme',
    'dark',
  )
  const before = await rendered(page)

  publish(light)
  await expect
    .poll(() => rendered(page))
    .toMatchObject({
      colorScheme: 'light',
      headingFont: 'Figtree',
      radius: '0.625rem',
      durationFast: '125ms',
      tempo: '1',
    })
  const after = await rendered(page)
  // base 20 / ratio 1.333 draws a bigger heading than base 16 / ratio 1.25.
  expect(Number.parseFloat(after.headingSize)).toBeLessThan(
    Number.parseFloat(before.headingSize),
  )
})
