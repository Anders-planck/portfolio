/** What the cursor ring shows over an element. */
export type CursorTarget =
  { kind: 'none' } | { kind: 'link' } | { kind: 'label'; label: string }

/** Elements the ring grows over; `data-cursor` names an action instead. */
const INTERACTIVE_SELECTOR =
  '[data-cursor], a[href], button, summary, [role="button"], [role="menuitem"]'

/**
 * The ring state for the element under the pointer: a label from the
 * nearest `data-cursor`, a larger ring over anything clickable, else none.
 */
export function readCursorTarget(element: Element | null): CursorTarget {
  const interactive = element?.closest(INTERACTIVE_SELECTOR)
  if (interactive === null || interactive === undefined) {
    return { kind: 'none' }
  }
  const label = interactive.getAttribute('data-cursor') ?? ''
  return label === '' ? { kind: 'link' } : { kind: 'label', label }
}
