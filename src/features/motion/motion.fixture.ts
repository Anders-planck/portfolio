/** The reader's settings a test runs under. */
export interface ReaderSettings {
  isReducedMotion: boolean
  hasFinePointer: boolean
}

/** Makes `matchMedia` answer the two queries MotionProvider asks. */
export function stubReaderSettings({
  isReducedMotion,
  hasFinePointer,
}: ReaderSettings): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches:
        (query.includes('prefers-reduced-motion') && isReducedMotion) ||
        (query.includes('pointer: fine') && hasFinePointer),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  })
}
