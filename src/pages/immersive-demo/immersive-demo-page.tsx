import { Banner } from '@astryxdesign/core/Banner'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useMemo } from 'react'

import type { BlockFaces } from '../../features/block/block-face'
import { useLocale } from '../../shared/i18n/use-locale'
import { Stage } from '../../widgets/stage/stage'
import type { StageChapter } from '../../widgets/stage/stage-chapter'
import { DEMO_COPY, type DemoCopy } from './immersive-demo-copy'

/**
 * The demo chapters: the anchors and the motion are the engine's test
 * fixture; every word is placeholder copy from `immersive-demo-copy.ts`, per locale. Tickets
 * 08–10 feed the Stage from Convex instead.
 */
function toDemoChaptersFromCopy({ chapters }: DemoCopy): StageChapter[] {
  const demoChapters = [
    { id: 'apertura', copy: chapters.opening, yawDeg: 20, scale: 1 },
    { id: 'scorrimento', copy: chapters.scroll, yawDeg: 140, scale: 0.9 },
    { id: 'puntatore', copy: chapters.pointer, yawDeg: 225, scale: 1 },
    { id: 'ancore', copy: chapters.anchors, yawDeg: 295, scale: 0.8 },
    { id: 'impaginazione', copy: chapters.layouts, yawDeg: 365, scale: 0.9 },
  ]
  return demoChapters.map(({ id, copy, yawDeg, scale }, chapterIndex) => ({
    id,
    eyebrow: copy.eyebrow,
    title: copy.title,
    // Uneven on purpose, to show the pacing: the opening scrolls longest.
    scrollShare: chapterIndex === 0 ? 30 : 20,
    blockPose: { yawDeg, scale },
    content: (
      <Text type="large" as="p" color="secondary">
        {copy.body}
      </Text>
    ),
  }))
}

function toDemoFacesFromCopy({ faceLabels, faceDetail }: DemoCopy): BlockFaces {
  const [first, second, third, fourth] = faceLabels
  return [
    { key: 'first', label: first, detail: faceDetail, tone: 'surface' },
    { key: 'second', label: second, detail: faceDetail, tone: 'blue' },
    { key: 'third', label: third, detail: faceDetail, tone: 'accent' },
    { key: 'fourth', label: fourth, detail: faceDetail, tone: 'orange' },
  ]
}

/**
 * A page that runs the immersive engine on placeholder copy, marked as a
 * demo on the page itself and kept out of search (noindex, no sitemap).
 */
export function ImmersiveDemoPage() {
  const demoCopy = DEMO_COPY[useLocale()]
  const chapters = useMemo(() => toDemoChaptersFromCopy(demoCopy), [demoCopy])
  const faces = useMemo(() => toDemoFacesFromCopy(demoCopy), [demoCopy])
  // A plain Stack, not LayoutContent: that one scrolls on its own, and an
  // inner scroller would unpin the scene (window scroll, ADR 0008).
  return (
    <Stack gap={4} paddingInline={8} paddingBlockStart={8}>
      <Banner status="info" title={demoCopy.notice} />
      <Stage chapters={chapters} faces={faces} />
    </Stack>
  )
}
