/** The number on a Face: its place on the Block from 01 (mockup Home). */
export function toFaceNumber(faceIndex: number): string {
  return String(faceIndex + 1).padStart(2, '0')
}
