export type Rect = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>

/** The translation of a computed `transform` (`none`, `matrix`, `matrix3d`). */
function readTranslation(transform: string): { left: number; top: number } {
  const values = /\(([^)]*)\)/.exec(transform)?.[1]?.split(',').map(Number)
  if (values === undefined) {
    return { left: 0, top: 0 }
  }
  const [left, top] = transform.startsWith('matrix3d')
    ? [values[12], values[13]]
    : [values[4], values[5]]
  return { left: left ?? 0, top: top ?? 0 }
}

/**
 * Where a translated control sits without its translation: the measured box
 * minus the computed transform, which is the in-flight value during a
 * transition. A magnetic pull then never measures itself.
 */
export function toUntransformedRect(rect: Rect, transform: string): Rect {
  const translation = readTranslation(transform)
  return {
    left: rect.left - translation.left,
    top: rect.top - translation.top,
    width: rect.width,
    height: rect.height,
  }
}
