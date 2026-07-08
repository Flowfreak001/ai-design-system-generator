import { notFound } from "next/navigation";
import { getBuiltinLibrarySections } from "@/lib/section-library/builtin-public";
import { FullSectionPreview } from "@/components/section-library/full-section-preview";

// Public real full-page preview of a built-in library section (real scroll,
// full-bleed — owns the viewport, no marketing header/footer).
export default async function PublicSectionPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = getBuiltinLibrarySections().find((s) => s.id === id);
  if (!section) notFound();
  return <FullSectionPreview section={section} publicMode />;
}
