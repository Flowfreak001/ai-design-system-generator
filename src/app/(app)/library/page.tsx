// Standalone Section Library. The catalog is agency-scoped, so it opens straight
// from the sidebar — no project required to browse, create, edit or delete.

import { requireUser } from "@/lib/auth";
import { LibraryCatalogClient } from "@/components/section-library/library-catalog-client";
import { listCatalogSections } from "@/lib/section-library/catalog-store";
import { seedBuiltinsForAgency } from "@/lib/section-library/builtin-seeds";
import { dynamicToLibrarySection } from "@/lib/section-library/dynamic-section";
import { isAdmin, canViewLibrarySection } from "@/lib/section-library/permissions";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await requireUser();
  const admin = isAdmin(user);

  // Provision the built-in sections into this agency's catalog (idempotent).
  if (user.agencyId) await seedBuiltinsForAgency(user.agencyId);

  const catalog = user.agencyId ? await listCatalogSections(user.agencyId) : [];
  const sections = catalog.filter((d) => {
    if (admin) return true;
    const auth = { sourceType: d.sourceType, createdByUserId: d.createdByUserId, status: d.status, visibility: d.visibility };
    if (d.status === "ready") return canViewLibrarySection(user, auth);
    return d.createdByUserId === user.id;
  }).map(dynamicToLibrarySection);

  return <LibraryCatalogClient sections={sections} isAdmin={admin} currentUserId={user.id} />;
}
