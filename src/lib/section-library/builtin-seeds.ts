// Provisions the platform's built-in Section Library as ONE GLOBAL set
// (agencyId: null) — the single source shown on the public /components page AND
// in every agency's authed library. The sections are authored TSX
// (props: { content, theme }) stored in builtin-sections.json. Seeded as global
// ADMIN sections (public + ready), editable/deletable only by admins.

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
// Single global namespace — NOT per agency. agencyId is null on every seeded row.
const PREFIX = "seed-global-";

let inFlight: Promise<void> | null = null;

/** Seed the built-in sections ONCE as a global set (idempotent, race-safe).
 *
 * STRICT no-override guarantee: the seeder NEVER deletes or overwrites anything
 * the user edited or created. It deletes only rows it can positively prove are
 * untouched auto-seeds (see `isPristine`). Any customized row is kept and its
 * base is skipped, so there is no revert and no duplicate. */
export async function seedGlobalBuiltins(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = doSeed().finally(() => { inFlight = null; });
  return inFlight;
}

/** Back-compat wrapper — all call sites pass an agencyId, but seeding is global. */
export async function seedBuiltinsForAgency(_agencyId: string): Promise<void> {
  return seedGlobalBuiltins();
}

async function doSeed(): Promise<void> {
  const first = SECTIONS[0];
  if (!first) return;
  const curPrefix = `${PREFIX}${SEED_VERSION}-`;
  // Hidden version sentinel (sourceType "system", filtered out of the catalog).
  const marker = `${curPrefix}__seed_marker__`;
  if (await prisma.librarySection.findUnique({ where: { id: marker } })) return;

  const baseOf = (id: string) => id.slice(PREFIX.length).replace(/^v\d+-/, "");

  // Classify every global seed row: "pristine" (untouched auto-seed we may
  // replace) vs "customized" (edited/adopted — must never be deleted).
  // Pristine ONLY if: createdBy null AND version 1 AND no config.categories key
  // AND updatedAt ~= createdAt. (categories is written by every real edit.)
  const seedRows = await prisma.librarySection.findMany({
    where: { agencyId: null, id: { startsWith: PREFIX } },
    select: { id: true, createdBy: true, version: true, config: true, createdAt: true, updatedAt: true },
  });
  const isPristine = (r: { createdBy: string | null; version: number; config: unknown; createdAt: Date; updatedAt: Date }) => {
    const cfg = (r.config ?? {}) as Record<string, unknown>;
    const untouchedConfig = !Object.prototype.hasOwnProperty.call(cfg, "categories");
    return r.createdBy === null && r.version === 1 && untouchedConfig && r.updatedAt.getTime() - r.createdAt.getTime() < 2000;
  };

  const customizedBases = new Set(
    seedRows.filter((r) => !isPristine(r) && !r.id.endsWith("__seed_marker__")).map((r) => baseOf(r.id)),
  );

  const toDelete = seedRows.filter((r) => isPristine(r) && !r.id.startsWith(curPrefix)).map((r) => r.id);
  if (toDelete.length) await prisma.librarySection.deleteMany({ where: { id: { in: toDelete } } });

  for (const b of SECTIONS) {
    if (customizedBases.has(b.id)) continue;
    const id = `${curPrefix}${b.id}`;
    if (await prisma.librarySection.findUnique({ where: { id } })) continue;
    await prisma.librarySection.create({
      data: {
        id, agencyId: null,
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

  await prisma.librarySection.create({
    data: {
      id: marker, agencyId: null,
      name: "__seed_marker__", slug: `seed-marker-${SEED_VERSION}`,
      sourceType: "system", status: "archived", visibility: "admin-only",
      createdBy: null,
    },
  });
}
