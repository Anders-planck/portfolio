/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appearance from "../appearance.js";
import type * as content from "../content.js";
import type * as model_appearance from "../model/appearance.js";
import type * as model_content_drafts from "../model/content/drafts.js";
import type * as model_content_limits from "../model/content/limits.js";
import type * as model_content_locales from "../model/content/locales.js";
import type * as model_content_pointers from "../model/content/pointers.js";
import type * as model_content_preview from "../model/content/preview.js";
import type * as model_content_profile from "../model/content/profile.js";
import type * as model_content_releases from "../model/content/releases.js";
import type * as model_content_requests from "../model/content/requests.js";
import type * as model_content_rollback from "../model/content/rollback.js";
import type * as model_content_rules from "../model/content/rules.js";
import type * as model_content_seed from "../model/content/seed.js";
import type * as model_content_snapshot from "../model/content/snapshot.js";
import type * as model_content_versions from "../model/content/versions.js";
import type * as model_env from "../model/env.js";
import type * as model_owner from "../model/owner.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appearance: typeof appearance;
  content: typeof content;
  "model/appearance": typeof model_appearance;
  "model/content/drafts": typeof model_content_drafts;
  "model/content/limits": typeof model_content_limits;
  "model/content/locales": typeof model_content_locales;
  "model/content/pointers": typeof model_content_pointers;
  "model/content/preview": typeof model_content_preview;
  "model/content/profile": typeof model_content_profile;
  "model/content/releases": typeof model_content_releases;
  "model/content/requests": typeof model_content_requests;
  "model/content/rollback": typeof model_content_rollback;
  "model/content/rules": typeof model_content_rules;
  "model/content/seed": typeof model_content_seed;
  "model/content/snapshot": typeof model_content_snapshot;
  "model/content/versions": typeof model_content_versions;
  "model/env": typeof model_env;
  "model/owner": typeof model_owner;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
