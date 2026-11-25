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
import type * as auth from "../auth.js";
import type * as content from "../content.js";
import type * as crons from "../crons.js";
import type * as e2e from "../e2e.js";
import type * as media from "../media.js";
import type * as metrics from "../metrics.js";
import type * as model_appearance from "../model/appearance.js";
import type * as model_content_altrule from "../model/content/altrule.js";
import type * as model_content_drafts from "../model/content/drafts.js";
import type * as model_content_limits from "../model/content/limits.js";
import type * as model_content_locales from "../model/content/locales.js";
import type * as model_content_numeralrule from "../model/content/numeralrule.js";
import type * as model_content_pointers from "../model/content/pointers.js";
import type * as model_content_preview from "../model/content/preview.js";
import type * as model_content_profile from "../model/content/profile.js";
import type * as model_content_prose from "../model/content/prose.js";
import type * as model_content_referencerule from "../model/content/referencerule.js";
import type * as model_content_releases from "../model/content/releases.js";
import type * as model_content_requests from "../model/content/requests.js";
import type * as model_content_rollback from "../model/content/rollback.js";
import type * as model_content_rulecontext from "../model/content/rulecontext.js";
import type * as model_content_rules from "../model/content/rules.js";
import type * as model_content_seed from "../model/content/seed.js";
import type * as model_content_snapshot from "../model/content/snapshot.js";
import type * as model_content_versions from "../model/content/versions.js";
import type * as model_env from "../model/env.js";
import type * as model_loopback from "../model/loopback.js";
import type * as model_media_alts from "../model/media/alts.js";
import type * as model_media_cv from "../model/media/cv.js";
import type * as model_media_files from "../model/media/files.js";
import type * as model_media_library from "../model/media/library.js";
import type * as model_media_references from "../model/media/references.js";
import type * as model_media_rulemedia from "../model/media/rulemedia.js";
import type * as model_media_storage from "../model/media/storage.js";
import type * as model_media_tables from "../model/media/tables.js";
import type * as model_media_uploads from "../model/media/uploads.js";
import type * as model_media_usage from "../model/media/usage.js";
import type * as model_media_variants from "../model/media/variants.js";
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
import type * as model_metrics_targets from "../model/metrics/targets.js";
import type * as model_owner from "../model/owner.js";
import type * as model_secret from "../model/secret.js";
import type * as model_sessions from "../model/sessions.js";
import type * as model_users from "../model/users.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appearance: typeof appearance;
  auth: typeof auth;
  content: typeof content;
  crons: typeof crons;
  e2e: typeof e2e;
  media: typeof media;
  metrics: typeof metrics;
  "model/appearance": typeof model_appearance;
  "model/content/altrule": typeof model_content_altrule;
  "model/content/drafts": typeof model_content_drafts;
  "model/content/limits": typeof model_content_limits;
  "model/content/locales": typeof model_content_locales;
  "model/content/numeralrule": typeof model_content_numeralrule;
  "model/content/pointers": typeof model_content_pointers;
  "model/content/preview": typeof model_content_preview;
  "model/content/profile": typeof model_content_profile;
  "model/content/prose": typeof model_content_prose;
  "model/content/referencerule": typeof model_content_referencerule;
  "model/content/releases": typeof model_content_releases;
  "model/content/requests": typeof model_content_requests;
  "model/content/rollback": typeof model_content_rollback;
  "model/content/rulecontext": typeof model_content_rulecontext;
  "model/content/rules": typeof model_content_rules;
  "model/content/seed": typeof model_content_seed;
  "model/content/snapshot": typeof model_content_snapshot;
  "model/content/versions": typeof model_content_versions;
  "model/env": typeof model_env;
  "model/loopback": typeof model_loopback;
  "model/media/alts": typeof model_media_alts;
  "model/media/cv": typeof model_media_cv;
  "model/media/files": typeof model_media_files;
  "model/media/library": typeof model_media_library;
  "model/media/references": typeof model_media_references;
  "model/media/rulemedia": typeof model_media_rulemedia;
  "model/media/storage": typeof model_media_storage;
  "model/media/tables": typeof model_media_tables;
  "model/media/uploads": typeof model_media_uploads;
  "model/media/usage": typeof model_media_usage;
  "model/media/variants": typeof model_media_variants;
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
  "model/metrics/targets": typeof model_metrics_targets;
  "model/owner": typeof model_owner;
  "model/secret": typeof model_secret;
  "model/sessions": typeof model_sessions;
  "model/users": typeof model_users;
  seed: typeof seed;
  sessions: typeof sessions;
  users: typeof users;
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

export declare const components: {
  auth: import("@convex-dev/auth/_generated/component.js").ComponentApi<"auth">;
  authGithub: import("@convex-dev/auth/components/github/_generated/component.js").ComponentApi<"authGithub">;
};
