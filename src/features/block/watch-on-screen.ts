/**
 * Tells whether `element` is on screen, each time that changes, so frame
 * work can pause while it is not. Returns the cleanup.
 */
export function watchOnScreen(
  element: Element,
  onChange: (isOnScreen: boolean) => void,
): () => void {
  const observer = new IntersectionObserver((entries) => {
    const latest = entries.at(-1)
    if (latest !== undefined) {
      onChange(latest.isIntersecting)
    }
  })
  observer.observe(element)
  return () => {
    observer.disconnect()
  }
}
