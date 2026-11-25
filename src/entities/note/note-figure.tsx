import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import type { NoteBlock } from './note-query-options'
import { NoteRuns } from './note-runs'

type FigureBlock = Extract<NoteBlock, { kind: 'figure' }>

/**
 * Which width the image takes, for the browser's pick from `srcset`. It
 * follows the note page's grid (`pages/note/note-page.tsx`): from Tailwind's
 * `lg` breakpoint the article spans three of four columns, below it the
 * whole width. `sizes` is an HTML attribute, so it cannot read CSS tokens.
 */
const GRID_MIN_WIDTH = '64rem'
const ARTICLE_SHARE_OF_VIEWPORT = '75vw'
const FIGURE_SIZES = `(min-width: ${GRID_MIN_WIDTH}) ${ARTICLE_SHARE_OF_VIEWPORT}, 100vw`

/**
 * A `::figure` of a note: its image from Media, with the AVIF/WebP variants
 * the backend listed (the original only while transformations are off), the
 * alt text of the page's locale, and its caption. Astryx has no image
 * component, so the image is a plain `img` inside Astryx layout.
 */
export function NoteFigure({ image, caption }: Omit<FigureBlock, 'kind'>) {
  return (
    <Stack as="figure" gap={2}>
      <img
        src={image.src}
        {...(image.srcSet === null
          ? {}
          : { srcSet: image.srcSet, sizes: FIGURE_SIZES })}
        width={image.widthPx}
        height={image.heightPx}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        className="h-auto w-full"
      />
      {caption.length > 0 && (
        <Stack as="figcaption">
          <Text type="supporting" color="secondary">
            <NoteRuns runs={caption} />
          </Text>
        </Stack>
      )}
    </Stack>
  )
}
