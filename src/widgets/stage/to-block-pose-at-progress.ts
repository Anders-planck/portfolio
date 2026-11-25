import {
  type BlockPose,
  FRONT_BLOCK_POSE,
} from '../../features/block/block-pose'
import type { ChapterScrollRange } from './to-chapter-scroll-ranges'

type PosedChapter = Pick<
  ChapterScrollRange,
  'scrollRangeStart' | 'scrollRangeEnd'
> & { blockPose: BlockPose }

interface PoseKeyframe {
  progress: number
  pose: BlockPose
}

function interpolate(from: number, to: number, share: number): number {
  return from + (to - from) * share
}

/**
 * The Block pose at a point of the Stage's scroll (0–1). Each chapter holds
 * its pose in the middle of its range; between two middles the pose moves
 * linearly from one to the next, so the Block turns while the reader
 * scrolls from one chapter to the next. Before the first middle and after
 * the last the end poses hold.
 */
export function toBlockPoseAtProgress(
  progress: number,
  chapters: readonly PosedChapter[],
): BlockPose {
  const keyframes: PoseKeyframe[] = chapters.map((chapter) => ({
    progress: (chapter.scrollRangeStart + chapter.scrollRangeEnd) / 2,
    pose: chapter.blockPose,
  }))
  const nextIndex = keyframes.findIndex(
    (keyframe) => keyframe.progress > progress,
  )
  if (nextIndex === -1) {
    return keyframes.at(-1)?.pose ?? FRONT_BLOCK_POSE
  }
  const next = keyframes[nextIndex]
  const previous = keyframes[nextIndex - 1]
  if (next === undefined || previous === undefined) {
    return next?.pose ?? FRONT_BLOCK_POSE
  }
  const share =
    (progress - previous.progress) / (next.progress - previous.progress)
  return {
    yawDeg: interpolate(previous.pose.yawDeg, next.pose.yawDeg, share),
    scale: interpolate(previous.pose.scale, next.pose.scale, share),
  }
}
