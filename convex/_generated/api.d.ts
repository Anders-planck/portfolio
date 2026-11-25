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
import type * as crons from "../crons.js";
import type * as metrics from "../metrics.js";
import type * as model_appearance from "../model/appearance.js";
import type * as model_content_drafts from "../model/content/drafts.js";
import type * as model_content_limits from "../model/content/limits.js";
import type * as model_content_locales from "../model/content/locales.js";
import type * as model_content_numeralrule from "../model/content/numeralrule.js";
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
import type * as model_metrics_adapters from "../model/metrics/adapters.js";
import type * as model_metrics_attempts from "../model/metrics/attempts.js";
import type * as model_metrics_checks from "../model/metrics/checks.js";
import type * as model_metrics_definitions from "../model/metrics/definitions.js";
import type * as model_metrics_format from "../model/metrics/format.js";
import type * as model_metrics_github from "../model/metrics/github.js";
import type * as model_metrics_http from "../model/metrics/http.js";
import type * as model_metrics_npm from "../model/metrics/npm.js";
import type * as model_metrics_numerals from "../model/metrics/numerals.js";
import type * as model_metrics_overview from "../model/metrics/overview.js";
import type * as model_metrics_readings from "../model/metrics/readings.js";
import type * as model_metrics_references from "../model/metrics/references.js";
import type * as model_metrics_refresh from "../model/metrics/refresh.js";
import type * as model_metrics_render from "../model/metrics/render.js";
import type * as model_metrics_seed from "../model/metrics/seed.js";
import type * as model_metrics_sources from "../model/metrics/sources.js";
import type * as model_metrics_status from "../model/metrics/status.js";
import type * as model_metrics_tables from "../model/metrics/tables.js";
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
  crons: typeof crons;
  metrics: typeof metrics;
  "model/appearance": typeof model_appearance;
  "model/content/drafts": typeof model_content_drafts;
  "model/content/limits": typeof model_content_limits;
  "model/content/locales": typeof model_content_locales;
  "model/content/numeralrule": typeof model_content_numeralrule;
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
  "model/metrics/adapters": typeof model_metrics_adapters;
  "model/metrics/attempts": typeof model_metrics_attempts;
  "model/metrics/checks": typeof model_metrics_checks;
  "model/metrics/definitions": typeof model_metrics_definitions;
  "model/metrics/format": typeof model_metrics_format;
  "model/metrics/github": typeof model_metrics_github;
  "model/metrics/http": typeof model_metrics_http;
  "model/metrics/npm": typeof model_metrics_npm;
  "model/metrics/numerals": typeof model_metrics_numerals;
  "model/metrics/overview": typeof model_metrics_overview;
  "model/metrics/readings": typeof model_metrics_readings;
  "model/metrics/references": typeof model_metrics_references;
  "model/metrics/refresh": typeof model_metrics_refresh;
  "model/metrics/render": typeof model_metrics_render;
  "model/metrics/seed": typeof model_metrics_seed;
  "model/metrics/sources": typeof model_metrics_sources;
  "model/metrics/status": typeof model_metrics_status;
  "model/metrics/tables": typeof model_metrics_tables;
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
