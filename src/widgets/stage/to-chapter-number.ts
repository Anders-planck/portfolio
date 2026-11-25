/**
 * The number a chapter shows in its eyebrow and in the chapter navigation:
 * its position from 00, the opening (resolution 3), on two digits.
 */
export function toChapterNumber(chapterIndex: number): string {
  return String(chapterIndex).padStart(2, '0')
}
