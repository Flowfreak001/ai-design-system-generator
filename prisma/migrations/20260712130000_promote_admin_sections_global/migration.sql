-- Global model follow-up: promote ADMIN-authored custom sections that were
-- created BEFORE the global refactor (still agency-scoped) into the global set,
-- so they appear on the public /components catalog like newly-added ones.
--
-- Scope: only admin sourceType, non-seed ids (real custom sections). Adopted
-- built-in edits (seed-<agency>- ids) stay per-agency — the global built-in
-- default is what shows publicly. Non-admin ("user") sections stay agency-private.
UPDATE "LibrarySection"
SET "agencyId" = NULL
WHERE "agencyId" IS NOT NULL
  AND "id" NOT LIKE 'seed-%'
  AND "sourceType" = 'admin';
