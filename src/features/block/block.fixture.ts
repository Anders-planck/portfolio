import type { BlockFaces } from './block-face'

export const TEST_FACES: BlockFaces = [
  { key: 'north', label: 'Nord', detail: 'n', tone: 'surface' },
  { key: 'east', label: 'Est', detail: 'e', tone: 'blue' },
  { key: 'south', label: 'Sud', detail: 's', tone: 'accent' },
  { key: 'west', label: 'Ovest', detail: 'o', tone: 'orange' },
]

/** Runs the animation frames queued so far. */
export async function waitForFrames(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}
