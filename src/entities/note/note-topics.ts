import type { NoteTopic } from './note-query-options'

// A record, so a topic added to the backend is a type error here until listed.
const NOTE_TOPIC_SET: Record<NoteTopic, true> = {
  ai: true,
  mobile: true,
  architecture: true,
}

export function isNoteTopic(value: string): value is NoteTopic {
  return value in NOTE_TOPIC_SET
}

/** Every note topic, in the order the filters and the editor list them. */
export const NOTE_TOPICS: readonly NoteTopic[] =
  Object.keys(NOTE_TOPIC_SET).filter(isNoteTopic)
