import type { SourceReading } from './attempts'
import { readGithubSource } from './github'
import { readNpmDownloads } from './npm'
import type { AutomatedSource } from './sources'

/** Reads one automated source once. `githubToken` comes from `model/env.ts`. */
export async function readSource(
  source: AutomatedSource,
  githubToken: string | null,
): Promise<SourceReading> {
  switch (source.kind) {
    case 'npm': {
      return readNpmDownloads(source)
    }
    case 'github-commits':
    case 'github-search': {
      return readGithubSource(source, githubToken)
    }
  }
}
