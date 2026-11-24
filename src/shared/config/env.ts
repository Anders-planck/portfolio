// The only module that reads environment values (ARC-08): every other module
// imports them from here, already validated.

/** Public URL of the Convex deployment, baked into the build by Vite. */
export function readConvexUrl(): string {
  const convexUrl = import.meta.env.VITE_CONVEX_URL
  if (convexUrl === undefined || convexUrl === '') {
    throw new Error('VITE_CONVEX_URL is not set; see .env.example')
  }
  return convexUrl
}
