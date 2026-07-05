import { notFound, redirect } from "next/navigation";
import { getProject } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { SectionEditPage } from "@/components/section-library/section-edit-page";
import { dynamicToLibrarySection } from "@/lib/section-library/dynamic-section";
import { getCatalogSection } from "@/lib/section-library/catalog-store";
import { canEditLibrarySection } from "@/lib/section-library/permissions";
import { STYLE_GUIDE_CANVAS_FILE, type StyleGuideCanvas } from "@/lib/canvas";

export const dynamic = "force-dynamic";

// "Edit content" for a CATALOG library item (metadata + default content only).
// Built-ins are shipped/global and not content-editable here — you edit the
// section AFTER adding it to a page (the instance). Requires edit permission.
export default async function SectionEditRoute({ params }: { params: Promise<{ id: string; sectionId: string }> }) {
  const { id, sectionId } = await params;
  const user = await requireUser();
  const project = user.agencyId ? await getProject(id, user.agencyId) : null;
  if (!project) notFound();

  const item = await getCatalogSection(sectionId, user.agencyId);
  if (!item) redirect(`/projects/${id}/references`);
  if (!canEditLibrarySection(user, { sourceType: item.sourceType, createdByUserId: item.createdByUserId })) {
    redirect(`/projects/${id}/references`);
  }

  const styleRaw = project.files.find((f) => f.name === STYLE_GUIDE_CANVAS_FILE)?.content;
  let style: StyleGuideCanvas | null = null;
  if (styleRaw) { try { style = JSON.parse(styleRaw) as StyleGuideCanvas; } catch { /* default theme */ } }

  return <SectionEditPage projectId={id} section={dynamicToLibrarySection(item)} style={style} />;
}
