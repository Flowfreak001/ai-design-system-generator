// Global Section Reference Library hub. The library itself is project-scoped
// (each project has its own SECTION_REFERENCE_LIBRARY.json), so this page lets
// the user pick a project to open its library — reachable from the sidebar
// without going through the editor.

import Link from "next/link";
import { listProjects } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { FadeUp } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await requireUser();
  const projects = user.agencyId ? await listProjects(user.agencyId) : [];

  const cards = projects.map((p) => ({ id: p.id, name: p.name, clientName: p.clientName }));

  return (
    <PageContainer>
      <PageHeader
        title="Section Library"
        description="Browse ready-made section designs and add them to a page. Pick a project to open its library."
      />

      {cards.length === 0 ? (
        <FadeUp className="card mt-8 flex flex-col items-center px-6 py-20 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-lg text-accent">🖼</span>
          <h3 className="mt-5 text-lg font-semibold">No projects yet</h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            The section library lives inside a project. Create a project first, then
            browse ready-made sections and add them to a page.
          </p>
          <LinkButton href="/projects/new" size="lg" className="mt-6">New project</LinkButton>
        </FadeUp>
      ) : (
        <FadeUp className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.id}
              href={`/projects/${c.id}/references`}
              className="card group flex flex-col gap-3 p-5 transition-colors hover:border-accent/40"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.7" />
                  <path d="m4.5 17 4.2-4.2a1.5 1.5 0 0 1 2.1 0L15 16.5m-1.5-1.5 1.7-1.7a1.5 1.5 0 0 1 2.1 0l2.2 2.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <span className="block font-medium text-ink group-hover:text-accent">{c.name}</span>
                <span className="block text-[12.5px] text-muted">{c.clientName ?? "—"}</span>
              </div>
              <span className="mt-auto text-[12px] text-faint">
                Open section library →
              </span>
            </Link>
          ))}
        </FadeUp>
      )}
    </PageContainer>
  );
}
