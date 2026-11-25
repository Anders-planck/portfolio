import { readEntranceTiming } from './read-entrance-timing'

export interface RevealOptions {
  entryDistancePx: number
  /** Delay between two targets; 0 reveals them together. */
  staggerDelayMs: number
}

/** Mockup values: reveal once a sliver of the block is inside the viewport. */
const ENTRY_OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: '0px 0px -8% 0px',
  threshold: 0.08,
}

/** Whether `element` starts below the fold, the only case that animates. */
function isBelowViewport(element: Element): boolean {
  return element.getBoundingClientRect().top >= window.innerHeight
}

function showTargets(targets: readonly HTMLElement[]): void {
  targets.forEach((target) => {
    target.style.removeProperty('opacity')
  })
}

/** Fades and lifts each target in, one after another, with the theme timing. */
function playEntrance(
  container: HTMLElement,
  targets: readonly HTMLElement[],
  { entryDistancePx, staggerDelayMs }: RevealOptions,
): void {
  const { durationMs, easing } = readEntranceTiming(container)
  showTargets(targets)
  targets.forEach((target, index) => {
    target.animate(
      [
        { opacity: 0, transform: `translateY(${String(entryDistancePx)}px)` },
        { opacity: 1, transform: 'none' },
      ],
      {
        duration: durationMs,
        easing,
        delay: index * staggerDelayMs,
        fill: 'backwards',
      },
    )
  })
}

/**
 * Hides the targets of a block that starts below the fold and plays their
 * entrance when the block scrolls in. A block already on screen is left as
 * it is, so the first paint never blinks; without script nothing is hidden.
 * Returns the cleanup, which shows the targets again.
 */
export function revealOnEntry(
  container: HTMLElement,
  targets: readonly HTMLElement[],
  options: RevealOptions,
): () => void {
  if (!isBelowViewport(container)) {
    return () => undefined
  }
  targets.forEach((target) => {
    target.style.opacity = '0'
  })
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect()
      playEntrance(container, targets, options)
    }
  }, ENTRY_OBSERVER_OPTIONS)
  observer.observe(container)
  return () => {
    observer.disconnect()
    showTargets(targets)
  }
}
