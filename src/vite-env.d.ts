/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Optional: a missing value must fail in src/shared/config/env.ts.
  readonly VITE_CONVEX_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
