import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import type { Ref } from 'react'

import type { BlockFaces, BlockFaceTone } from './block-face'
import { toFaceNumber } from './to-face-number'

/** Face n sits n quarter turns around the vertical axis. */
const FACE_TURN_CLASSES = [
  'rotate-y-0',
  'rotate-y-90',
  'rotate-y-180',
  'rotate-y-270',
] as const

const FACE_TONE_CLASSES: Record<BlockFaceTone, string> = {
  surface: 'bg-surface text-primary',
  accent: 'bg-accent-bg text-on-accent',
  blue: 'bg-blue-subtle text-blue-vivid',
  teal: 'bg-teal-subtle text-teal-vivid',
  orange: 'bg-orange-subtle text-orange-vivid',
  yellow: 'bg-yellow-subtle text-yellow-vivid',
}

/**
 * The geometry of the Block in CSS 3D (ADR 0007): four faces around the
 * vertical axis and a cap on top and bottom, at the rest pose (leaning
 * back, a little turned). Each face is a turned wrapper with the face pushed
 * out inside it, since Tailwind's `translate` applies before `rotate`. A
 * driven Block writes its transform over the rest pose through `blockRef`;
 * the transition eases it, except while `data-dragging` is set.
 */
export function BlockShape({
  faces,
  blockRef,
}: {
  faces: BlockFaces
  blockRef?: Ref<HTMLElement>
}) {
  return (
    <Stack
      {...(blockRef !== undefined && { ref: blockRef })}
      className="relative h-80 w-48 transform-3d -rotate-x-14 rotate-y-20 transition-transform duration-(--duration-slow) ease-(--ease-move) data-dragging:transition-none"
    >
      {faces.map((face, faceIndex) => (
        <Stack
          key={face.key}
          className={`absolute inset-0 transform-3d ${FACE_TURN_CLASSES[faceIndex] ?? ''}`}
        >
          <Stack
            justify="between"
            padding={6}
            className={`absolute inset-0 translate-z-24 rounded-inner border border-border ${FACE_TONE_CLASSES[face.tone]}`}
          >
            <Stack direction="horizontal" justify="between">
              {/* A bare ordinal, the same in every locale: no copy to translate. */}
              <Text type="code" color="inherit">
                {toFaceNumber(faceIndex)}
              </Text>
              <Text type="code" color="inherit">
                {face.detail}
              </Text>
            </Stack>
            <Text size="xl" weight="bold" color="inherit">
              {face.label}
            </Text>
          </Stack>
        </Stack>
      ))}
      <Stack className="absolute inset-x-0 top-16 h-48 transform-3d rotate-x-90">
        <Stack className="size-full translate-z-40 rounded-inner bg-gray-subtle">
          {null}
        </Stack>
      </Stack>
      <Stack className="absolute inset-x-0 top-16 h-48 transform-3d -rotate-x-90">
        <Stack className="size-full translate-z-40 rounded-inner bg-accent-muted">
          {null}
        </Stack>
      </Stack>
    </Stack>
  )
}
