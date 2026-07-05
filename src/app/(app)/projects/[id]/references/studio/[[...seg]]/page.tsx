import { notFound, redirect } from "next/navigation";
import { getProject } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { SectionStudio } from "@/components/section-library/section-studio";
import { newDynamicSectionDraft } from "@/lib/section-library/dynamic-section";
import { listCatalogSections, getCatalogSection } from "@/lib/section-library/catalog-store";
import { isAdmin, canEditLibrarySection } from "@/lib/section-library/permissions";
import { STYLE_GUIDE_CANVAS_FILE, type StyleGuideCanvas } from "@/lib/canvas";

export const dynamic = "force-dynamic";

// The Studio is available to every signed-in user — anyone can author their own
// sections. Editing an EXISTING section requires ownership (or admin on an
// admin item); enforced here and again in the save action.
export default async function SectionStudioRoute({ params }: { params: Promise<{ id: string; seg?: string[] }> }) {
  const { id, seg } = await params;
  const user = await requireUser();
  const project = user.agencyId ? await getProject(id, user.agencyId) : null;
  if (!project) notFound();

  // The switcher only lists sections the user may edit (own + admin's when admin).
  const all = user.agencyId ? await listCatalogSections(user.agencyId) : [];
  const editable = all.filter((s) => canEditLibrarySection(user, { sourceType: s.sourceType, createdByUserId: s.createdByUserId }));

  // /studio (blank) | /studio/<catalogId> (edit)
  let initial = newDynamicSectionDraft();
  if (seg?.[0]) {
    const existing = await getCatalogSection(seg[0], user.agencyId);
    if (existing) {
      if (!canEditLibrarySection(user, { sourceType: existing.sourceType, createdByUserId: existing.createdByUserId })) {
        redirect(`/projects/${id}/references`);
      }
      initial = existing;
    }
  }
  // New sections created by a non-admin default to a personal (user) item.
  if (!seg?.[0] && !isAdmin(user)) initial = { ...initial, sourceType: "user", visibility: "private" };

  const styleRaw = project.files.find((f) => f.name === STYLE_GUIDE_CANVAS_FILE)?.content;
  let style: StyleGuideCanvas | null = null;
  if (styleRaw) { try { style = JSON.parse(styleRaw) as StyleGuideCanvas; } catch { /* default theme */ } }

  return <SectionStudio projectId={id} initial={initial} sections={editable} style={style} />;
}
