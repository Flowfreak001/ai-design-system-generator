// Provisions the platform's built-in Section Library into every agency's catalog.
// The sections are authored TSX (props: { content, theme }) stored in
// builtin-sections.json. Seeded as global ADMIN sections — visible to all users
// (public + ready), editable/deletable only by admins (createdBy: null).

import { prisma } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";
import { slugify } from "./dynamic-section";
import BUILTIN_SECTIONS from "./builtin-sections.json";

type BuiltinSection = {
  id: string; name: string; category: string; layoutType: string; description: string;
  tags: string[]; editableFields: string[]; codeMode: string; originality: string;
  defaultContent: unknown; tsxCode: string;
};

const SECTIONS = BUILTIN_SECTIONS as unknown as BuiltinSection[];

const SEED_VERSION = "v110";

/** Seed the built-in sections into an agency's catalog once (idempotent).
 *
 * STRICT no-override guarantee: the seeder NEVER deletes or overwrites anything
 * the user edited or created. It deletes only rows it can positively prove are
 * untouched auto-seeds (see `isPristine` below — createdBy null AND version 1 AND
 * no `categories` config key AND unchanged updatedAt). Any customized row is kept
 * and its base is skipped, so there is no revert and no duplicate. Brand-new user
 * sections (non-`seed-` ids) are never even considered. */
export async function seedBuiltinsForAgency(agencyId: string): Promise<void> {
  const first = SECTIONS[0];
  if (!first) return;
  const prefix = `seed-${agencyId}-`;
  const curPrefix = `${prefix}${SEED_VERSION}-`;
  // Hidden version sentinel (sourceType "system", filtered out of the catalog).
  // Its presence — not any content section — marks this version as seeded, so
  // idempotency holds even when some bases are intentionally skipped below.
  const marker = `${curPrefix}__seed_marker__`;
  if (await prisma.librarySection.findUnique({ where: { id: marker } })) return;

  const baseOf = (id: string) => id.slice(prefix.length).replace(/^v\d+-/, "");

  // STRICT no-override rule. We inspect EVERY seed-namespaced row for this agency
  // and classify each as "pristine" (an untouched auto-seed we may replace) or
  // "customized" (the user edited or adopted it — must never be deleted).
  //
  // A row is pristine ONLY if ALL hold:
  //   - createdBy is null            (never adopted; forward edits set the owner)
  //   - version === 1               (a code edit bumps version)
  //   - config has NO "categories" key  (upsertCatalogSection ALWAYS writes a
  //       `categories` key on any save — name-only edits included — whereas the
  //       seeder writes only `{ description }`; so its presence deterministically
  //       marks an edited row, even a LEGACY edit made before adoption existed)
  //   - updatedAt ~= createdAt       (belt-and-suspenders: any edit moves updatedAt)
  // Anything failing ANY guard is treated as customized: never deleted, never
  // overwritten with a fresh default.
  const seedRows = await prisma.librarySection.findMany({
    where: { agencyId, id: { startsWith: prefix } },
    select: { id: true, createdBy: true, version: true, config: true, createdAt: true, updatedAt: true },
  });
  const isPristine = (r: { createdBy: string | null; version: number; config: unknown; createdAt: Date; updatedAt: Date }) => {
    const cfg = (r.config ?? {}) as Record<string, unknown>;
    const untouchedConfig = !Object.prototype.hasOwnProperty.call(cfg, "categories");
    return (
      r.createdBy === null &&
      r.version === 1 &&
      untouchedConfig &&
      r.updatedAt.getTime() - r.createdAt.getTime() < 2000
    );
  };

  // Bases the user has customized (edited or adopted) — keep theirs, never re-add
  // a default. Exclude the hidden version sentinel from this set.
  const customizedBases = new Set(
    seedRows.filter((r) => !isPristine(r) && !r.id.endsWith("__seed_marker__")).map((r) => baseOf(r.id)),
  );

  // Delete ONLY pristine previous-version rows (and stale sentinels). Never a
  // customized row. Explicit id list — no broad createdBy-null sweep.
  const toDelete = seedRows
    .filter((r) => isPristine(r) && !r.id.startsWith(curPrefix))
    .map((r) => r.id);
  if (toDelete.length) {
    await prisma.librarySection.deleteMany({ where: { id: { in: toDelete } } });
  }

  for (const b of SECTIONS) {
    if (customizedBases.has(b.id)) continue; // user owns a customized copy — keep theirs
    const id = `${curPrefix}${b.id}`;
    if (await prisma.librarySection.findUnique({ where: { id } })) continue;
    await prisma.librarySection.create({
      data: {
        id, agencyId,
        name: b.name, slug: slugify(b.name),
        category: b.category, layoutType: b.layoutType,
        componentName: b.name.replace(/\s+/g, ""),
        sourceType: "admin", status: "ready", visibility: "public",
        codeMode: b.codeMode || "studio-tsx",
        tsxCode: b.tsxCode,
        config: { description: b.description } as unknown as Prisma.InputJsonValue,
        defaultContent: (b.defaultContent ?? {}) as unknown as Prisma.InputJsonValue,
        editableFields: b.editableFields ?? [], tags: b.tags ?? [],
        originality: b.originality || "Original design — placeholder media only.",
        version: 1, createdBy: null,
      },
    });
  }

  // Write the sentinel last so a crash mid-seed re-runs cleanly next time.
  await prisma.librarySection.create({
    data: {
      id: marker, agencyId,
      name: "__seed_marker__", slug: `seed-marker-${SEED_VERSION}`,
      sourceType: "system", status: "archived", visibility: "admin-only",
      createdBy: null,
    },
  });
}
