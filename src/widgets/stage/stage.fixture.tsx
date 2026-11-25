import { Text } from '@astryxdesign/core/Text'
import type { ReactNode } from 'react'

import { DEFAULT_MOTION_KNOBS } from '../../features/motion/motion-knobs'
import {
  type MotionSettings,
  MotionSettingsContext,
} from '../../features/motion/motion-provider'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import type { StageChapter } from './stage-chapter'

export { TEST_FACES } from '../../features/block/block.fixture'

function createChapter(id: string, eyebrow: string, title: string) {
  return {
    id,
    eyebrow,
    title,
    scrollShare: 20,
    blockPose: { yawDeg: 0, scale: 1 },
    content: <Text as="p">{`Testo di ${eyebrow}`}</Text>,
  }
}

export const TEST_CHAPTERS: StageChapter[] = [
  createChapter('inizio', 'Inizio', 'Titolo di apertura'),
  createChapter('mezzo', 'Mezzo', 'Titolo di mezzo'),
  createChapter('fine', 'Fine', 'Titolo di chiusura'),
]

/** A reader who gets the immersive layout: a mouse, motion allowed. */
export const ANIMATED_FINE_POINTER: MotionSettings = {
  mode: 'animated',
  pointer: 'fine',
  knobs: DEFAULT_MOTION_KNOBS,
}

/** Makes `(min-width: …)` queries match on a wide screen only. */
export function stubScreenWidth({ isWide }: { isWide: boolean }): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: query.includes('min-width') && isWide,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  })
}

/**
 * Replaces IntersectionObserver with one the test drives: `reportActive`
 * says which observed element now covers the middle of the viewport.
 */
export function stubIntersectionObserver() {
  const observers: {
    callback: IntersectionObserverCallback
    targets: Element[]
  }[] = []
  class TestIntersectionObserver {
    private readonly targets: Element[] = []
    constructor(callback: IntersectionObserverCallback) {
      observers.push({ callback, targets: this.targets })
    }
    observe(target: Element) {
      this.targets.push(target)
    }
    disconnect() {
      this.targets.length = 0
    }
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: TestIntersectionObserver,
  })
  return {
    reportActive(target: Element) {
      observers
        .filter((observer) => observer.targets.includes(target))
        .forEach((observer) => {
          observer.callback(
            [{ target, isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver,
          )
        })
    },
  }
}

/** Renders `ui` at `path` for a reader with `motionSettings`. */
export function renderForReader(
  ui: ReactNode,
  motionSettings: MotionSettings,
  path = '/',
) {
  return renderAtPath(
    <MotionSettingsContext value={motionSettings}>{ui}</MotionSettingsContext>,
    path,
  )
}
