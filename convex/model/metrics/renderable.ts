import type { QueryCtx } from '../../_generated/server'
import { findMetricByKey, readLatestReading } from './readings'
import type { RenderableMetric } from './render'

/**
 * The metrics a text names, as `renderMetricReferences` needs them: each
 * key's format and last verified reading. A key with no metric is left out,
 * so it renders `unavailable`.
 */
export async function readRenderableMetrics(
  ctx: QueryCtx,
  keys: readonly string[],
): Promise<ReadonlyMap<string, RenderableMetric>> {
  const entries = await Promise.all(
    [...new Set(keys)].map(async (key) => {
      const metric = await findMetricByKey(ctx, key)
      if (metric === null) {
        return []
      }
      const reading = await readLatestReading(ctx, metric._id)
      const renderable: RenderableMetric = {
        format: metric.format,
        reading:
          reading === null
            ? null
            : {
                figure: { value: reading.value, total: reading.total },
                verifiedAt: reading.verifiedAt,
              },
      }
      return [[key, renderable] as const]
    }),
  )
  return new Map(entries.flat())
}
