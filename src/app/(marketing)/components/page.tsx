import type { Metadata } from "next";
import { PublicLibrary } from "@/components/library/public-library";
import { listPublicCatalogSections } from "@/lib/section-library/catalog-store";
import { dynamicToLibrarySection } from "@/lib/section-library/dynamic-section";
import { seedGlobalBuiltins } from "@/lib/section-library/builtin-seeds";
import { auth } from "@/lib/auth";
import { listSavedIds } from "@/lib/saved-sections/store";

export const metadata: Metadata = {
  title: "Section Library — Flowfreak",
  description: "Browse production-ready, themeable website sections. Headers, heroes, features, pricing, testimonials, footers and more — preview live and export for your stack.",
};

export const dynamic = "force-dynamic";

export default async function ComponentsPage() {
  // One source of truth: the global section set in the DB (built-ins + any
  // admin-published sections). Seed the global built-ins on first visit.
  await seedGlobalBuiltins();
  const defs = await listPublicCatalogSections();
  const sections = defs.map((d) => ({ ...dynamicToLibrarySection(d), origin: "builtin" as const }));
  const user = await auth();
  const savedIds = user ? await listSavedIds(user.id) : [];
  return <PublicLibrary sections={sections} isAuthed={!!user} savedIds={savedIds} />;
}
