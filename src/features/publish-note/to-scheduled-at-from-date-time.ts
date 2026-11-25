/** A picked publication time: none yet, in the past, or a future instant. */
export type ScheduledAt =
  { kind: 'none' } | { kind: 'past' } | { kind: 'future'; scheduledAt: number }

/**
 * The instant of a `YYYY-MM-DDTHH:MM` value from the date time picker, read
 * in the owner's own time zone (the browser's), against `now`.
 */
export function toScheduledAtFromDateTime(
  dateTime: string | undefined,
  now: number,
): ScheduledAt {
  if (dateTime === undefined) {
    return { kind: 'none' }
  }
  const scheduledAt = new Date(dateTime).getTime()
  if (Number.isNaN(scheduledAt)) {
    return { kind: 'none' }
  }
  return scheduledAt > now ? { kind: 'future', scheduledAt } : { kind: 'past' }
}
