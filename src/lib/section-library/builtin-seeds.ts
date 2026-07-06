// One-time seeding of the 10 built-in sections into the editable global catalog
// so they become first-class LibrarySection rows (sourceType "admin") that admins
// can edit in the Studio — no duplicates, every card editable.
//
// Each seed carries a self-contained TSX component (props: { content, theme }) —
// a faithful re-implementation of the shipped section using inline styles + brand
// tokens, so it renders standalone through the sucrase engine.

import { prisma } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";
import { MANUAL_SECTION_LIBRARY } from "./manual-sections";
import { slugify } from "./dynamic-section";

export const BUILTIN_TSX: Record<string, string> = {};

/** Seed the built-in sections into an agency's catalog once (idempotent). */
export async function seedBuiltinsForAgency(agencyId: string): Promise<void> {
  // Blank slate: no starter sections to seed. Sections are authored fresh in
  // the Section Studio, one at a time.
  const first = MANUAL_SECTION_LIBRARY[0];
  if (!first) return;
  const marker = `seed-${agencyId}-${first.id}`;
  if (await prisma.librarySection.findUnique({ where: { id: marker } })) return;

  for (const b of MANUAL_SECTION_LIBRARY) {
    const code = BUILTIN_TSX[b.id];
    if (!code) continue;
    const id = `seed-${agencyId}-${b.id}`;
    if (await prisma.librarySection.findUnique({ where: { id } })) continue;
    await prisma.librarySection.create({
      data: {
        id, agencyId,
        name: b.name, slug: slugify(b.name),
        category: b.category, layoutType: b.layoutType,
        componentName: b.name.replace(/\s+/g, ""),
        sourceType: "admin", status: "ready", visibility: "public", codeMode: "studio-tsx",
        tsxCode: code,
        config: { description: b.description } as unknown as Prisma.InputJsonValue,
        defaultContent: b.defaultContent as unknown as Prisma.InputJsonValue,
        editableFields: b.editableFields, tags: b.tags,
        originality: "Built-in starter section — original design.",
        version: 1, createdBy: null,
      },
    });
  }
}
