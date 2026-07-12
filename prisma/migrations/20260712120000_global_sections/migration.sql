-- Global Section Library model: built-ins become ONE global set (agencyId NULL),
-- shown on public /components AND every agency's library. This migration removes
-- the OLD per-agency built-in seeds that are provably untouched — they are
-- replaced by the global set. Adopted/edited seeds (createdBy set, or a
-- `categories` config key, or version > 1, or modified after creation) are
-- PRESERVED as agency-owned work. Manual sections (non-`seed-` ids) are untouched.

-- Untouched per-agency built-in seeds (strict pristine test).
DELETE FROM "LibrarySection"
WHERE "agencyId" IS NOT NULL
  AND "id" LIKE 'seed-%'
  AND "id" NOT LIKE 'seed-global-%'
  AND "sourceType" <> 'system'
  AND "createdBy" IS NULL
  AND "version" = 1
  AND (("config" -> 'categories') IS NULL)
  AND ("updatedAt" - "createdAt" < interval '2 seconds');

-- Old per-agency version sentinels (internal bookkeeping rows).
DELETE FROM "LibrarySection"
WHERE "id" LIKE 'seed-%'
  AND "id" NOT LIKE 'seed-global-%'
  AND "sourceType" = 'system';
