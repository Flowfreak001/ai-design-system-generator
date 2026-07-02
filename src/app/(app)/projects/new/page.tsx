import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listClients } from "@/lib/clients";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  const user = await requireUser();
  const clients = user.agencyId ? await listClients(user.agencyId) : [];

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-8">
      <Link href="/projects" className="text-sm text-muted transition-colors hover:text-ink">
        ← Projects
      </Link>
      <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.02em]">New Project</h2>
      <p className="mt-1 text-sm text-muted">
        Pick the client and project type — generated files and the workflow
        blueprint are built from this brief.
      </p>
      <div className="mt-8">
        <ProjectForm
          clients={clients.map((c) => ({ id: c.id, name: c.name }))}
          defaultClientId={client}
        />
      </div>
    </div>
  );
}
