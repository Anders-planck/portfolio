/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as content_drafts from "../content/drafts.js";
import type * as content_locales from "../content/locales.js";
import type * as content_previewToken from "../content/previewToken.js";
import type * as content_profile from "../content/profile.js";
import type * as content_rules from "../content/rules.js";
import type * as content_snapshot from "../content/snapshot.js";
import type * as content_store from "../content/store.js";
import type * as lib_requireOwner from "../lib/requireOwner.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "content/drafts": typeof content_drafts;
  "content/locales": typeof content_locales;
  "content/previewToken": typeof content_previewToken;
  "content/profile": typeof content_profile;
  "content/rules": typeof content_rules;
  "content/snapshot": typeof content_snapshot;
  "content/store": typeof content_store;
  "lib/requireOwner": typeof lib_requireOwner;
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
