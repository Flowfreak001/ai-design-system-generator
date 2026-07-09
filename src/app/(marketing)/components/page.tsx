import type { Metadata } from "next";
import { PublicLibrary } from "@/components/library/public-library";
import { getBuiltinLibrarySections } from "@/lib/section-library/builtin-public";
import { auth } from "@/lib/auth";
import { listSavedIds } from "@/lib/saved-sections/store";

export const metadata: Metadata = {
  title: "Section Library — Flowfreak",
  description: "Browse production-ready, themeable website sections. Headers, heroes, features, pricing, testimonials, footers and more — preview live and export for your stack.",
};

export const dynamic = "force-dynamic";

export default async function ComponentsPage() {
  const sections = getBuiltinLibrarySections();
  const user = await auth();
  const savedIds = user ? await listSavedIds(user.id) : [];
  return <PublicLibrary sections={sections} isAuthed={!!user} savedIds={savedIds} />;
}
