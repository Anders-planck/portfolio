import type { Doc, Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import type { Snapshot } from './snapshot'

/** Versions: immutable snapshots of a document, written only by publish. */

export async function writeVersions(
  ctx: MutationCtx,
  snapshots: Snapshot[],
  now: number,
) {
  return Promise.all(
    snapshots.map((snapshot) =>
      ctx.db.insert('versions', {
        collection: snapshot.collection,
        key: snapshot.key,
        snapshot,
        createdAt: now,
      }),
    ),
  )
}

export async function readVersions(
  ctx: QueryCtx,
  versionIds: Id<'versions'>[],
): Promise<Doc<'versions'>[]> {
  return Promise.all(
    versionIds.map(async (versionId) => {
      const version = await ctx.db.get(versionId)
      if (version === null) {
        // Versions are immutable and never deleted; a release cannot lose one.
        throw new Error(`Missing version ${versionId}`)
      }
      return version
    }),
  )
}
