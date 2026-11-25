import { type Infer, v } from 'convex/values'

/**
 * Image variants through Cloudflare Image transformations (pure). Nothing is
 * stored per variant: `/cdn-cgi/image/<options>/<original>` on the zone that
 * has transformations on resizes on the first request and caches the
 * result. `format=auto` answers AVIF or WebP by the browser's `Accept`
 * header, and `metadata=none` drops whatever metadata is left.
 * Without a transform origin (local dev, CI, workers.dev previews) every
 * variant is the original.
 */

/** Widths offered in `srcset` (mockup `cms-media`): phone 1x–3x, then desktop. */
export const IMAGE_VARIANT_WIDTHS_PX = [390, 780, 1170, 1440, 2160] as const

/** The `src` fallback for browsers that ignore `srcset`: a phone at 2x. */
const FALLBACK_WIDTH_PX = 780

export const imageSourcesValidator = v.object({
  src: v.string(),
  /** Null when variants are off: the original is the only source. */
  srcSet: v.union(v.string(), v.null()),
})
export type ImageSources = Infer<typeof imageSourcesValidator>

export function toImageSources(
  image: { originalUrl: string; widthPx: number },
  transformOrigin: string | null,
): ImageSources {
  if (transformOrigin === null) {
    return { src: image.originalUrl, srcSet: null }
  }
  // Never ask for more pixels than the original has (fit=scale-down would
  // serve the original size anyway, under a misleading `w` descriptor).
  const widths = IMAGE_VARIANT_WIDTHS_PX.filter(
    (width) => width < image.widthPx,
  )
  const variantWidths = [...widths, image.widthPx]
  const toVariantUrl = (width: number) =>
    toTransformUrl(transformOrigin, image.originalUrl, width)
  return {
    src: toVariantUrl(Math.min(FALLBACK_WIDTH_PX, image.widthPx)),
    srcSet: variantWidths
      .map((width) => `${toVariantUrl(width)} ${String(width)}w`)
      .join(', '),
  }
}

function toTransformUrl(
  transformOrigin: string,
  originalUrl: string,
  widthPx: number,
) {
  const options = [
    `width=${String(widthPx)}`,
    'fit=scale-down',
    'format=auto',
    'metadata=none',
  ].join(',')
  return `${transformOrigin}/cdn-cgi/image/${options}/${originalUrl}`
}
