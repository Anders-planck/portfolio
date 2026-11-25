import { Center } from '@astryxdesign/core/Center'
import { Text } from '@astryxdesign/core/Text'
import { useEffect, useRef } from 'react'

import { followPointer } from './follow-pointer'
import { canFollowPointer, useMotionSettings } from './use-motion-settings'

/**
 * The attribute on `<body>` that hides the system cursor while this one
 * draws (`SiteDocument` styles it). Never set otherwise, so on touch or with
 * reduced motion the system cursor always shows (resolution 8).
 */
const CUSTOM_CURSOR_ATTRIBUTE = 'data-custom-cursor'

/**
 * Cursor: a dot on the pointer and a ring that follows with inertia, larger
 * over links and with a label over a `data-cursor` element. Theme coloured;
 * a surface-coloured outline keeps the ring visible on dark slabs. Only with
 * a fine pointer and without reduced motion.
 */
export function Cursor() {
  const motion = useMotionSettings()
  if (!canFollowPointer(motion)) {
    return null
  }
  return <CursorShape ringInertia={motion.knobs.ringInertia} />
}

function CursorShape({ ringInertia }: { ringInertia: number }) {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const ring = ringRef.current
    const dot = dotRef.current
    const label = labelRef.current
    if (ring === null || dot === null || label === null) {
      return undefined
    }
    const stopFollowing = followPointer({ ring, dot, label }, ringInertia)
    document.body.toggleAttribute(CUSTOM_CURSOR_ATTRIBUTE, true)
    return () => {
      stopFollowing()
      document.body.removeAttribute(CUSTOM_CURSOR_ATTRIBUTE)
    }
  }, [ringInertia])

  return (
    <>
      <Center
        ref={ringRef}
        aria-hidden="true"
        data-cursor-ring=""
        className="group pointer-events-none fixed top-0 left-0 z-50 size-8 -translate-1/2 rounded-full border-2 border-accent opacity-0 outline-2 outline-surface data-active:opacity-100 data-label:size-21 data-label:bg-accent data-link:size-13"
      >
        <Text
          ref={labelRef}
          type="label"
          className="hidden text-on-accent group-data-label:inline"
        >
          {null}
        </Text>
      </Center>
      <Center
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 size-1.5 -translate-1/2 rounded-full bg-accent opacity-0 data-active:opacity-100 data-label:opacity-0"
      >
        {null}
      </Center>
    </>
  )
}
