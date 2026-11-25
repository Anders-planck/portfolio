import { expect, test } from '@playwright/test'

test('old project addresses move for good to Lavori (ADR 0001)', async ({
  request,
}) => {
  const response = await request.get('/projects/bussola?ref=cv', {
    maxRedirects: 0,
  })
  expect(response.status()).toBe(301)
  expect(response.headers().location).toMatch(/\/lavori\/bussola\?ref=cv$/)
})

test('the Italian prefix moves to the address without it', async ({
  request,
}) => {
  const response = await request.get('/it/lavori', { maxRedirects: 0 })
  expect(response.status()).toBe(301)
  expect(response.headers().location).toMatch(/\/lavori$/)
})

test('a redirect followed in the browser lands on the new address', async ({
  page,
}) => {
  await page.goto('/projects/bussola')
  await expect(page).toHaveURL(/\/lavori\/bussola$/)
})
