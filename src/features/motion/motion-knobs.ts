import type { Appearance } from '../../entities/appearance/appearance'

/**
 * The site's own motion knobs, beside Astryx tempo and character (user
 * story 36). Durations and curves are not here: they are the theme's
 * duration and easing tokens, which the published tempo and character
 * already set in the CSS (ADR 0010).
 */
export interface MotionKnobs {
  /** How far a revealed block travels up as it fades in. */
  entryDistancePx: number
  /** Delay between two items of a staggered list. */
  staggerDelayMs: number
  /** Share of the distance the cursor ring closes each frame (0–1). */
  ringInertia: number
  /** Pointer distance from a magnetic control's centre where it starts to pull. */
  magneticRadiusPx: number
  /** Share of the pointer offset a magnetic control follows (0–1). */
  magneticStrength: number
}

/**
 * The defaults of the motion screen in the CMS mockup (cms-animazioni).
 * The owner will publish these with the rest of Motion (ticket 16, #25);
 * until then they hold.
 */
export const DEFAULT_MOTION_KNOBS: MotionKnobs = {
  entryDistancePx: 28,
  staggerDelayMs: 60,
  ringInertia: 0.18,
  magneticRadiusPx: 200,
  magneticStrength: 0.35,
}

/**
 * The knobs at the published tempo: tempo scales every theme duration, so it
 * scales the stagger delay too, and the reveal keeps its rhythm.
 */
export function toMotionKnobsFromMotion(
  motion: Appearance['motion'],
): MotionKnobs {
  return {
    ...DEFAULT_MOTION_KNOBS,
    staggerDelayMs: DEFAULT_MOTION_KNOBS.staggerDelayMs * motion.tempo,
  }
}
