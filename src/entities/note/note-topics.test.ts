import { expect, test } from 'vitest'

import { isNoteTopic, NOTE_TOPICS } from './note-topics'

test('the topics are the backend’s, in filter order', () => {
  expect(NOTE_TOPICS).toEqual(['ai', 'mobile', 'architecture'])
})

test('only a known topic is a topic', () => {
  expect(isNoteTopic('mobile')).toBe(true)
  expect(isNoteTopic('cucina')).toBe(false)
})
