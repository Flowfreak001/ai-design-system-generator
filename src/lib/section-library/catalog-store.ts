// Global Section catalog data layer. Admin/custom/forked sections live in the
// LibrarySection table (agency-scoped, reusable across all of an agency's
// projects) — NOT per-project JSON. Built-in sections stay in code. This module
// maps table rows <-> the in-memory DynamicSectionDef used by the UI.

import { prisma } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";
import type { LibrarySectionModel } from "@/generated/prisma/models";
import { SECTION_HISTORY_CAP, slugify, type DynamicSectionDef } from "./dynamic-section";
import type { SectionLibraryCategory, SectionLibraryStatus } from "./manual-sections";

type CodeHistory = { code: string; at: string }[];

function rowToDef(r: LibrarySectionModel): DynamicSectionDef {
  const config = (r.config ?? {}) as { description?: string; categories?: string[] };
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category as SectionLibraryCategory,
    categories: config.categories?.length ? (config.categories as SectionLibraryCategory[]) : undefined,
    layoutType: r.layoutType,
    description: config.description ?? "",
    tags: r.tags,
    sourceType: r.sourceType as DynamicSectionDef["sourceType"],
    visibility: r.visibility as DynamicSectionDef["visibility"],
    createdByUserId: r.createdBy,
    version: r.version,
    componentCode: r.tsxCode ?? "",
    codeMode: r.codeMode === "html-css" ? "html" : "react",
    defaultContent: (r.defaultContent ?? {}) as DynamicSectionDef["defaultContent"],
    editableFields: r.editableFields,
    originalityRule: r.originality,
    status: r.status as SectionLibraryStatus,
    history: (r.history ?? []) as CodeHistory,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function listCatalogSections(agencyId: string | null): Promise<DynamicSectionDef[]> {
  const rows = await prisma.librarySection.findMany({ where: { agencyId }, orderBy: { updatedAt: "desc" } });
  return rows.map(rowToDef);
}

export async function getCatalogSection(id: string, agencyId: string | null): Promise<DynamicSectionDef | null> {
  const row = await prisma.librarySection.findFirst({ where: { id, agencyId } });
  return row ? rowToDef(row) : null;
}

/** Create or update a catalog section, snapshotting code history on change. */
export async function upsertCatalogSection(
  agencyId: string | null,
  createdBy: string | null,
  def: DynamicSectionDef,
): Promise<DynamicSectionDef> {
  const existing = await prisma.librarySection.findFirst({ where: { id: def.id, agencyId } });
  const codeChanged = Boolean(existing) && existing!.tsxCode !== def.componentCode;

  let history = (def.history ?? []) as CodeHistory;
  if (existing && codeChanged) {
    history = [{ code: existing.tsxCode ?? "", at: existing.updatedAt.toISOString() }, ...history].slice(0, SECTION_HISTORY_CAP);
  }
  const version = existing ? (codeChanged ? existing.version + 1 : existing.version) : 1;

  const data = {
    agencyId,
    name: def.name,
    slug: def.slug || slugify(def.name),
    category: def.category,
    layoutType: def.layoutType,
    componentName: def.name.replace(/\s+/g, "") || "CustomSection",
    sourceType: def.sourceType,
    status: def.status,
    visibility: def.visibility,
    codeMode: def.codeMode === "html" ? "html-css" : "studio-tsx",
    tsxCode: def.componentCode,
    // Persist the multi-category set (always includes the primary) in config JSON
    // — no schema column needed. Empty when only the primary applies.
    config: {
      description: def.description,
      categories: def.categories?.length ? Array.from(new Set([def.category, ...def.categories])) : [],
    } as unknown as Prisma.InputJsonValue,
    defaultContent: def.defaultContent as unknown as Prisma.InputJsonValue,
    editableFields: def.editableFields,
    tags: def.tags,
    originality: def.originalityRule,
    version,
    history: history as unknown as Prisma.InputJsonValue,
  };

  const row = existing
    ? await prisma.librarySection.update({ where: { id: existing.id }, data })
    // Keep the client-provided id stable so repeated saves update the same row.
    : await prisma.librarySection.create({ data: { ...data, id: def.id, createdBy } });
  return rowToDef(row);
}

export async function deleteCatalogSection(id: string, agencyId: string | null): Promise<void> {
  await prisma.librarySection.deleteMany({ where: { id, agencyId } });
}
