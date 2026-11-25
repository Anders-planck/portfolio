// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import type { Id } from '../../../convex/_generated/dataModel'
import { PublishOutcomeBanner } from './publish-outcome-banner'

afterEach(cleanup)

const RELEASE_ID = 'release-a' as Id<'releases'>

test('nothing is said before a publish', () => {
  const { container } = render(
    <PublishOutcomeBanner publishState={{ kind: 'idle' }} />,
  )

  expect(container.textContent).toBe('')
})

test('each publish outcome is said in its own words', () => {
  render(
    <>
      <PublishOutcomeBanner
        publishState={{
          kind: 'answered',
          outcome: { status: 'scheduled', releaseId: RELEASE_ID, findings: [] },
        }}
      />
      <PublishOutcomeBanner
        publishState={{
          kind: 'answered',
          outcome: { status: 'stale', documents: [] },
        }}
      />
      <PublishOutcomeBanner publishState={{ kind: 'unconfirmed' }} />
    </>,
  )

  expect(screen.getByText('Pubblicazione programmata.')).toBeDefined()
  expect(screen.getByText(/La bozza è cambiata nel frattempo/)).toBeDefined()
  expect(
    screen.getByText('Pubblicazione non confermata: riprova.'),
  ).toBeDefined()
})

test('a blocked publish lists what blocked it', () => {
  render(
    <PublishOutcomeBanner
      publishState={{
        kind: 'answered',
        outcome: {
          status: 'blocked',
          findings: [
            {
              rule: 'free-numeral',
              severity: 'block',
              field: 'body',
              locale: 'it',
              message: 'Free number "3"',
              collection: 'note',
              key: 'note-a',
            },
          ],
        },
      }}
    />,
  )

  expect(screen.getByText('Pubblicazione bloccata dai controlli')).toBeDefined()
  expect(screen.getByText('Free number "3"')).toBeDefined()
})
