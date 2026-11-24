# 0005 · CMS access: Convex Auth with GitHub, owner allowlist

Status: accepted · 2026-11-24

The CMS uses Convex Auth with the GitHub OAuth provider. An allowlist of GitHub user ids (env `OWNER_GITHUB_IDS`) defines the owner; every CMS query, mutation and action starts with `requireOwner`. Single user for v1; the users table keeps a role field so roles can come later. Sessions are listed and revocable in the CMS.
