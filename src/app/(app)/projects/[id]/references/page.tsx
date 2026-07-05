import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { SectionLibraryClient } from "@/components/section-library/section-library-client";
import { dynamicToLibrarySection } from "@/lib/section-library/dynamic-section";
import { listCatalogSections } from "@/lib/section-library/catalog-store";
import { seedBuiltinsForAgency } from "@/lib/section-library/builtin-seeds";
import { isAdmin, canViewLibrarySection } from "@/lib/section-library/permissions";
import { SITEMAP_CANVAS_FILE, STYLE_GUIDE_CANVAS_FILE, type SitemapCanvas, type StyleGuideCanvas } from "@/lib/canvas";

export const dynamic = "force-dynamic";

export default async function ReferencesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = user.agencyId ? await getProject(id, user.agencyId) : null;
  if (!project) notFound();

  const canvasRaw = project.files.find((f) => f.name === SITEMAP_CANVAS_FILE)?.content;
  let pages: { id: string; name: string }[] = [];
  if (canvasRaw) { try { pages = (JSON.parse(canvasRaw) as SitemapCanvas).pages.map((p) => ({ id: p.id, name: p.name })); } catch { /* none */ } }

  const styleRaw = project.files.find((f) => f.name === STYLE_GUIDE_CANVAS_FILE)?.content;
  let style: StyleGuideCanvas | null = null;
  if (styleRaw) { try { style = JSON.parse(styleRaw) as StyleGuideCanvas; } catch { /* default theme */ } }

  const admin = isAdmin(user);

  // Provision the built-in sections into this agency's editable catalog once, so
  // every card (built-in or custom) is a real, admin-editable catalog item.
  if (user.agencyId) await seedBuiltinsForAgency(user.agencyId);

  // Global (agency) catalog. Each row is either an admin/global item or a user's
  // own item. Users see: ready+visible items (their own + public) plus their own
  // drafts. Admins see everything.
  const catalog = user.agencyId ? await listCatalogSections(user.agencyId) : [];
  const sections = catalog.filter((d) => {
    const auth = { sourceType: d.sourceType, createdByUserId: d.createdByUserId, status: d.status, visibility: d.visibility };
    if (admin) return true;
    const mine = d.createdByUserId === user.id;
    if (d.status === "ready") return canViewLibrarySection(user, auth);
    return mine; // drafts/archived only visible to their creator
  }).map(dynamicToLibrarySection);

  return (
    <SectionLibraryClient
      projectId={id}
      projectName={project.name}
      sections={sections}
      pages={pages}
      style={style}
      isAdmin={admin}
      currentUserId={user.id}
    />
  );
}
