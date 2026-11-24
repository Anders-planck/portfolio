/// <reference types="vite/client" />

/** Every Convex module, keyed from the `convex/` root as convex-test expects. */
export const modules = import.meta.glob('./**/*.ts')
