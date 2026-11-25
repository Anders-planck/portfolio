/** The theme colour pairs a face can wear (project colour tokens). */
export type BlockFaceTone =
  'surface' | 'accent' | 'blue' | 'teal' | 'orange' | 'yellow'

/** One Face of the Block, as the page gives it. */
export interface BlockFace {
  /** Stable across renders and locales. */
  key: string
  label: string
  /** The small line opposite the face number (a year, a code). */
  detail: string
  tone: BlockFaceTone
}

/** The Block has exactly four faces (GLOSSARY). */
export type BlockFaces = readonly [BlockFace, BlockFace, BlockFace, BlockFace]
