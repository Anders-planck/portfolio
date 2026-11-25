import { type RefObject, useEffect, useState } from 'react'

/**
 * The rendered height of an element in px, kept current as it resizes (a
 * ResizeObserver, not a per-frame read). 0 until it is measured.
 */
export function useElementHeight(elementRef: RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const element = elementRef.current
    if (element === null) {
      return
    }
    const measure = () => {
      setHeight(Math.round(element.getBoundingClientRect().height))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [elementRef])

  return height
}
