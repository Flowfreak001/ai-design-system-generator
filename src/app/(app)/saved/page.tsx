import { requireUser } from "@/lib/auth";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { listSaved } from "@/lib/saved-sections/store";
import { getBuiltinLibrarySections } from "@/lib/section-library/builtin-public";
import { SavedSectionsGrid } from "@/components/library/saved-sections-grid";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const user = await requireUser();
  const saved = await listSaved(user.id).catch(() => []);

  // Keep saved order (newest first) and resolve each to its full library section.
  const byId = new Map(getBuiltinLibrarySections().map((s) => [s.id, s]));
  const sections = saved
    .map((row) => byId.get(row.sectionId))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <PageContainer>
      <PageHeader title="Saved sections" description="Sections you've bookmarked from the library — preview, copy the prompt, or remove." />
      <div className="mt-6">
        <SavedSectionsGrid sections={sections} />
      </div>
    </PageContainer>
  );
}
