import type { FunctionReturnType } from 'convex/server'

import type { api } from '../../../convex/_generated/api'

/** Published theme and motion params, as Convex validated them on publish. */
export type Appearance = FunctionReturnType<typeof api.appearance.getPublished>
