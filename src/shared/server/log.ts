// The only module that writes to the console (TS-04): server code reports
// through it. On the Worker the lines land in the Workers logs.

/** Logs a failure that `context` recovers from or passes on. */
export function log(context: string, error: unknown): void {
  console.error(`[${context}]`, error)
}
