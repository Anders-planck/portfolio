/**
 * Surfaces in the top layer or over the page (menus, drawers, dialogs). The
 * custom cursor draws under the top layer, so while one is open the system
 * cursor must show.
 */
const SURFACE_SELECTOR = [
  'dialog[open]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[role="menu"]',
].join(', ')

/** Where the reader types: the native I-beam says so better than a ring. */
const TEXT_ENTRY_SELECTOR = [
  'input:not([type="button"], [type="submit"], [type="reset"], [type="checkbox"], [type="radio"], [type="range"], [type="color"], [type="file"], [type="image"])',
  'textarea',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[contenteditable="plaintext-only"]',
].join(', ')

/**
 * Whether a surface is on screen: Astryx keeps some closed ones in the DOM
 * (the menu drawer), hidden.
 */
function hasOpenSurface(document: Document): boolean {
  return Array.from(document.querySelectorAll(SURFACE_SELECTOR)).some(
    (surface) => surface.checkVisibility(),
  )
}

function hasOpenPopover(document: Document): boolean {
  try {
    return document.querySelector('[popover]:popover-open') !== null
  } catch {
    // An engine without `:popover-open` cannot show a popover either.
    return false
  }
}

/**
 * Whether the system cursor shows instead of the custom one: for a pen or a
 * finger (only a mouse draws the ring), over text entry, and while a
 * surface over the page is open.
 */
export function shouldUseSystemCursor({
  target,
  pointerType,
}: {
  target: Element
  pointerType: string
}): boolean {
  const document = target.ownerDocument
  return (
    pointerType !== 'mouse' ||
    target.closest(TEXT_ENTRY_SELECTOR) !== null ||
    hasOpenSurface(document) ||
    hasOpenPopover(document)
  )
}
