import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { ReferenceLibraryClient } from "@/components/references/reference-library-client";
import { SECTION_REFERENCE_LIBRARY_FILE, type ReferenceLibrary } from "@/lib/references/types";

export const dynamic = "force-dynamic";

export default async function ReferencesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = user.agencyId ? await getProject(id, user.agencyId) : null;
  if (!project) notFound();

  const raw = project.files.find((f) => f.name === SECTION_REFERENCE_LIBRARY_FILE)?.content;
  let lib: ReferenceLibrary = { patterns: [] };
  if (raw) { try { lib = JSON.parse(raw) as ReferenceLibrary; } catch { /* keep empty */ } }

  return <ReferenceLibraryClient projectId={id} projectName={project.name} initialPatterns={lib.patterns} />;
}
