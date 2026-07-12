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
 * Never overrides user work. A built-in the user has edited becomes "adopted"
 * (its row gets a non-null createdBy, see upsertCatalogSection) — the seeder
 * then leaves it alone AND does not re-add a pristine default for that base.
 * Brand-new user sections (non-seed ids) are likewise never touched. */
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

  // Bases the user has customized: an edited built-in (adopted → createdBy set)
  // for THIS agency. These must survive re-seeding untouched, and we must not
  // recreate their default. Derive the base id back out of the seed id.
  const adoptedRows = await prisma.librarySection.findMany({
    where: { agencyId, id: { startsWith: prefix }, NOT: { createdBy: null } },
    select: { id: true },
  });
  const adoptedBases = new Set(
    adoptedRows.map((r) => r.id.slice(prefix.length).replace(/^v\d+-/, "")),
  );

  // Remove ONLY previous-version auto-seed rows the user hasn't touched
  // (createdBy null). Adopted/edited rows (createdBy set) and user-authored
  // sections (non-seed ids) are never deleted. Old sentinels are cleaned here too.
  await prisma.librarySection.deleteMany({
    where: { agencyId, createdBy: null, id: { startsWith: prefix }, NOT: { id: { startsWith: curPrefix } } },
  });

  for (const b of SECTIONS) {
    if (adoptedBases.has(b.id)) continue; // user owns a customized copy — keep theirs
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
