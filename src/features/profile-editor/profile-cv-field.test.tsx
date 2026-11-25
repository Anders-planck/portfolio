// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import type { Id } from '../../../convex/_generated/dataModel'
import { ProfileCvField } from './profile-cv-field'

afterEach(cleanup)

const CV_ID = 'media-cv' as Id<'media'>
const CHOICES = [{ mediaId: CV_ID, fileName: 'cv-anders-planck.pdf' }]

test('the chosen PDF is shown by its file name', () => {
  render(
    <ProfileCvField
      cvMediaId={CV_ID}
      cvChoices={CHOICES}
      onCvChange={vi.fn()}
    />,
  )

  expect(screen.getByRole('combobox', { name: 'CV' }).textContent).toContain(
    'cv-anders-planck.pdf',
  )
})

test('picking a PDF makes it the CV', async () => {
  const onCvChange = vi.fn()
  render(
    <ProfileCvField
      cvMediaId={null}
      cvChoices={CHOICES}
      onCvChange={onCvChange}
    />,
  )

  fireEvent.click(screen.getByRole('combobox', { name: 'CV' }))
  fireEvent.click(
    await screen.findByRole('option', { name: 'cv-anders-planck.pdf' }),
  )

  expect(onCvChange).toHaveBeenCalledWith(CV_ID)
})
