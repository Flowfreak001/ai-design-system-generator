import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { SectionStudio } from "@/components/section-library/section-studio";
import { newDynamicSectionDraft } from "@/lib/section-library/dynamic-section";
import { listCatalogSections, getCatalogSection } from "@/lib/section-library/catalog-store";
import { isAdmin, canEditLibrarySection } from "@/lib/section-library/permissions";

export const dynamic = "force-dynamic";

// Standalone Section Studio — author sections without a project. The catalog is
// agency-scoped, so no project context is needed. Preview uses the default theme.
export default async function LibraryStudioRoute({ params }: { params: Promise<{ seg?: string[] }> }) {
  const { seg } = await params;
  const user = await requireUser();

  const all = user.agencyId ? await listCatalogSections(user.agencyId) : [];
  const editable = all.filter((s) => canEditLibrarySection(user, { sourceType: s.sourceType, createdByUserId: s.createdByUserId }));

  let initial = newDynamicSectionDraft();
  if (seg?.[0] && user.agencyId) {
    const existing = await getCatalogSection(seg[0], user.agencyId);
    if (existing) {
      if (!canEditLibrarySection(user, { sourceType: existing.sourceType, createdByUserId: existing.createdByUserId })) {
        redirect("/library");
      }
      initial = existing;
    }
  }
  if (!seg?.[0] && !isAdmin(user)) initial = { ...initial, sourceType: "user", visibility: "private" };

  return <SectionStudio initial={initial} sections={editable} style={null} />;
}
