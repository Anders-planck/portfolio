import type { ReactNode } from 'react'

import type { BlockPose } from '../../features/block/block-pose'

/**
 * One Chapter of an immersive page, as the page gives it to the Stage. The
 * page's chapters and chapter content (Convex, tickets 08–10) map to this.
 */
export interface StageChapter {
  /** The anchor: `#id` links to the chapter. Unique on the page. */
  id: string
  /** The short name in the eyebrow, the chapter index and the navigation. */
  eyebrow: string
  /** The chapter heading (`h1` for the opening, `h2` after it). */
  title: string
  /** The pacing weight the owner sets; an average one scrolls one viewport. */
  scrollShare: number
  blockPose: BlockPose
  /** Everything under the heading. */
  content: ReactNode
}
