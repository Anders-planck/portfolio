// The only module that writes to the console (TS-04): every other module
// reports through it.

/**
 * Records a failure the page recovered from, so it is not lost even though
 * the reader sees nothing wrong. On the Worker it lands in the Workers logs.
 */
export function logRecoveredError(context: string, error: unknown): void {
  console.error(`[${context}]`, error)
}
