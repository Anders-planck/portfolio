/** Where the Stage is on screen, as `getBoundingClientRect` gives it. */
export interface StagePlacement {
  stageTopPx: number
  stageHeightPx: number
  viewportHeightPx: number
}

/**
 * How far the reader is through the Stage (0–1): where the middle of the
 * viewport falls on it. The middle line is also the one that makes a chapter
 * active, so the Block and the chapter index always agree.
 */
export function toStageProgress({
  stageTopPx,
  stageHeightPx,
  viewportHeightPx,
}: StagePlacement): number {
  if (stageHeightPx <= 0) {
    return 0
  }
  const progress = (viewportHeightPx / 2 - stageTopPx) / stageHeightPx
  return Math.min(1, Math.max(0, progress))
}
