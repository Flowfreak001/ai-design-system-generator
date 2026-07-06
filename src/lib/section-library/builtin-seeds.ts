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

/** Seed the built-in sections into an agency's catalog once (idempotent). */
export async function seedBuiltinsForAgency(agencyId: string): Promise<void> {
  const first = SECTIONS[0];
  if (!first) return;
  // Version marker — bump the suffix if the built-in set changes so agencies re-seed.
  const prefix = `seed-${agencyId}-`;
  const curPrefix = `${prefix}v15-`;
  const marker = `${curPrefix}${first.id}`;
  if (await prisma.librarySection.findUnique({ where: { id: marker } })) return;

  // Not on the current set yet — remove any PREVIOUS built-in seeds for this
  // agency (auto-seeded rows have createdBy: null). User-authored sections
  // (createdBy set) are never touched.
  await prisma.librarySection.deleteMany({
    where: { agencyId, createdBy: null, id: { startsWith: prefix }, NOT: { id: { startsWith: curPrefix } } },
  });

  for (const b of SECTIONS) {
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
}
