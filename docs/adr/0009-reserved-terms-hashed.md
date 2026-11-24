# 0009 · Reserved terms are stored hashed and checked on the server

Status: accepted · 2026-11-24

Terms that must never be published (employer product/domain words) are stored in an internal Convex table as salted SHA-256 hashes of normalized tokens and n-grams (salt in env `RESERVED_TERMS_SALT`). They are writable by the owner, never readable back (the UI shows masked chips and a count). The check runs on the server at publish, on every locale, on alt text, slugs, SEO fields, media file names and metadata, and on AI output before it is stored.
