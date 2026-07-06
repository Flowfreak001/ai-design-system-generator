"use server";

// Project-independent Section Library actions. The catalog is agency-scoped, so
// authoring/editing/deleting sections needs no project — the Studio and Library
// are reachable straight from the sidebar.

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getCatalogSection, upsertCatalogSection, deleteCatalogSection } from "@/lib/section-library/catalog-store";
import { isAdmin, canEditLibrarySection, canDeleteLibrarySection } from "@/lib/section-library/permissions";
import type { DynamicSectionDef } from "@/lib/section-library/dynamic-section";

export async function saveLibrarySectionAction(def: DynamicSectionDef): Promise<{ error?: string; id?: string }> {
  const user = await requireUser();
  if (!user.agencyId) return { error: "No agency." };
  if (!def.componentCode?.trim()) return { error: "Component code is required." };

  const existing = await getCatalogSection(def.id, user.agencyId);
  if (existing) {
    if (!canEditLibrarySection(user, { sourceType: existing.sourceType, createdByUserId: existing.createdByUserId })) {
      return { error: "You can only edit sections you created." };
    }
    def = { ...def, sourceType: existing.sourceType, visibility: existing.visibility, createdByUserId: existing.createdByUserId };
  } else {
    const admin = isAdmin(user);
    def = { ...def, sourceType: admin ? "admin" : "user", visibility: admin ? "public" : "private", createdByUserId: user.id };
  }

  const saved = await upsertCatalogSection(user.agencyId, user.id, def);
  revalidatePath("/library");
  return { id: saved.id };
}

export async function deleteLibrarySectionAction(sectionId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId) return { error: "No agency." };

  const existing = await getCatalogSection(sectionId, user.agencyId);
  if (!existing) return {};
  if (!canDeleteLibrarySection(user, { sourceType: existing.sourceType, createdByUserId: existing.createdByUserId })) {
    return { error: "You can only delete sections you created." };
  }
  await deleteCatalogSection(sectionId, user.agencyId);
  revalidatePath("/library");
  return {};
}
