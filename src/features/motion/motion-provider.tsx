import { useMediaQuery } from '@astryxdesign/core/hooks'
import { createContext, type ReactNode, useMemo } from 'react'

import { useAppearance } from '../../entities/appearance/use-appearance'
import {
  DEFAULT_MOTION_KNOBS,
  type MotionKnobs,
  toMotionKnobsFromTempo,
} from './motion-knobs'

/** Reduced motion always wins over the published params (GLOSSARY: Motion). */
export type MotionMode = 'animated' | 'reduced'

/** A mouse or trackpad (fine) or a finger (coarse). */
export type PointerKind = 'fine' | 'coarse'

/**
 * How the site may move for this reader: the published Motion (as knobs)
 * after their reduced-motion setting and their pointer.
 */
export interface MotionSettings {
  mode: MotionMode
  pointer: PointerKind
  knobs: MotionKnobs
}

/**
 * What a page renders before it knows the reader's settings: on the server
 * and in the first client render, nothing moves and nothing follows the
 * pointer, so no one gets motion they turned off.
 */
const STILL_MOTION_SETTINGS: MotionSettings = {
  mode: 'reduced',
  pointer: 'coarse',
  knobs: DEFAULT_MOTION_KNOBS,
}

export const MotionSettingsContext = createContext<MotionSettings>(
  STILL_MOTION_SETTINGS,
)

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const FINE_POINTER_QUERY = '(pointer: fine)'

/**
 * The motion settings of the whole site: the published params (live from Convex), the
 * reader's reduced-motion setting and their pointer. Durations and curves
 * reach the primitives through the theme tokens; this adds the knobs and the
 * two checks.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const { appearance } = useAppearance()
  const isReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY, true)
  const hasFinePointer = useMediaQuery(FINE_POINTER_QUERY, false)
  const { tempo } = appearance.motion
  const motionSettings = useMemo<MotionSettings>(
    () => ({
      mode: isReducedMotion ? 'reduced' : 'animated',
      pointer: hasFinePointer ? 'fine' : 'coarse',
      knobs: toMotionKnobsFromTempo(tempo),
    }),
    [isReducedMotion, hasFinePointer, tempo],
  )
  return (
    <MotionSettingsContext value={motionSettings}>
      {children}
    </MotionSettingsContext>
  )
}
