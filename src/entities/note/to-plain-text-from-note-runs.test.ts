import { expect, test } from 'vitest'

import { toPlainRuns } from './note.fixture'
import { toPlainTextFromNoteRuns } from './to-plain-text-from-note-runs'

test('runs read as plain text for the head; a missing figure is named', () => {
  expect(
    toPlainTextFromNoteRuns(
      [
        ...toPlainRuns('Ho '),
        { kind: 'unavailable', key: 'k', marks: [] },
        {
          kind: 'link',
          href: '/a',
          children: [{ kind: 'code', text: 'useState' }],
        },
      ],
      'n.d.',
    ),
  ).toBe('Ho n.d.useState')
})
