import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCatalogSection } from "@/lib/section-library/catalog-store";
import { dynamicToLibrarySection } from "@/lib/section-library/dynamic-section";
import { canViewLibrarySection, isAdmin } from "@/lib/section-library/permissions";
import { FullSectionPreview } from "@/components/section-library/full-section-preview";

export const dynamic = "force-dynamic";

// Real full-page preview of a catalog section so scroll animations can be tested.
export default async function LibrarySectionPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (!user.agencyId) notFound();

  const def = await getCatalogSection(id, user.agencyId);
  if (!def) notFound();

  const auth = { sourceType: def.sourceType, createdByUserId: def.createdByUserId, status: def.status, visibility: def.visibility };
  const mine = def.createdByUserId === user.id;
  if (!isAdmin(user) && !mine && !(def.status === "ready" && canViewLibrarySection(user, auth))) notFound();

  return <FullSectionPreview section={dynamicToLibrarySection(def)} />;
}
