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

// Strip the seed prefix (`seed-<scope>-v<NN>-`) to a stable base key so a global
// built-in and an agency's adopted copy of it dedupe to one card. User sections
// (non-seed ids) key to their own unique id.
const SEED_BASE_RE = /^seed-[^-]+-v\d+-/;
const baseKey = (id: string) => id.replace(SEED_BASE_RE, "");

/** The authed catalog for an agency: the GLOBAL set plus the agency's own
 *  sections. When both a global built-in and an agency-owned (adopted/edited)
 *  copy exist for the same base, the agency's copy wins. */
export async function listCatalogSections(agencyId: string | null): Promise<DynamicSectionDef[]> {
  const where = agencyId
    ? { OR: [{ agencyId: null }, { agencyId }], NOT: { sourceType: "system" } }
    : { agencyId: null, NOT: { sourceType: "system" } };
  const rows = await prisma.librarySection.findMany({ where, orderBy: { updatedAt: "desc" } });

  const byBase = new Map<string, (typeof rows)[number]>();
  for (const r of rows) {
    const key = baseKey(r.id);
    const cur = byBase.get(key);
    if (!cur) byBase.set(key, r);
    else if (cur.agencyId === null && r.agencyId !== null) byBase.set(key, r); // prefer agency-owned
  }
  return [...byBase.values()]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map(rowToDef);
}

/** The PUBLIC catalog (logged-out /components): global, public, ready sections. */
export async function listPublicCatalogSections(): Promise<DynamicSectionDef[]> {
  const rows = await prisma.librarySection.findMany({
    where: { agencyId: null, visibility: "public", status: "ready", NOT: { sourceType: "system" } },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(rowToDef);
}

export async function getCatalogSection(id: string, agencyId: string | null): Promise<DynamicSectionDef | null> {
  // Visible to the agency if it's global (agencyId null) or owned by the agency.
  const row = await prisma.librarySection.findFirst({
    where: agencyId ? { id, OR: [{ agencyId: null }, { agencyId }] } : { id, agencyId: null },
  });
  return row ? rowToDef(row) : null;
}

/** Create or update a catalog section, snapshotting code history on change. */
export async function upsertCatalogSection(
  agencyId: string | null,
  createdBy: string | null,
  def: DynamicSectionDef,
): Promise<DynamicSectionDef> {
  // Find by id alone (ids are globally unique). On update we PRESERVE the row's
  // existing scope (global stays global, agency stays agency); `agencyId` is the
  // desired scope for a NEW row only.
  const existing = await prisma.librarySection.findUnique({ where: { id: def.id } });
  const scope = existing ? existing.agencyId : agencyId;
  const codeChanged = Boolean(existing) && existing!.tsxCode !== def.componentCode;

  let history = (def.history ?? []) as CodeHistory;
  if (existing && codeChanged) {
    history = [{ code: existing.tsxCode ?? "", at: existing.updatedAt.toISOString() }, ...history].slice(0, SECTION_HISTORY_CAP);
  }
  const version = existing ? (codeChanged ? existing.version + 1 : existing.version) : 1;

  const data = {
    agencyId: scope,
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

  // "Adopt" an auto-seeded built-in the first time it's edited: stamp the editor
  // as its owner (createdBy) so the seeder treats it as user work and never
  // deletes or reverts it on a future version bump. Regular rows keep their owner.
  const adopt = Boolean(existing) && existing!.createdBy === null && createdBy != null && existing!.id.startsWith("seed-");

  const row = existing
    ? await prisma.librarySection.update({ where: { id: existing.id }, data: adopt ? { ...data, createdBy } : data })
    // Keep the client-provided id stable so repeated saves update the same row.
    : await prisma.librarySection.create({ data: { ...data, id: def.id, createdBy } });
  return rowToDef(row);
}

export async function deleteCatalogSection(id: string, _agencyId: string | null): Promise<void> {
  // ids are globally unique; permission is checked in the calling action.
  await prisma.librarySection.deleteMany({ where: { id } });
}
