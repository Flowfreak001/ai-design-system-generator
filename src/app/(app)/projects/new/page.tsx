import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listClients } from "@/lib/clients";
import { ProjectWizard } from "@/components/projects/project-wizard";

export const metadata: Metadata = { title: "New design system" };

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  const user = await requireUser();
  const clients = user.agencyId ? await listClients(user.agencyId) : [];

  return (
    <div className="px-5 py-8 sm:px-8">
      <Link href="/projects" className="text-sm text-muted transition-colors hover:text-ink">
        ← Projects
      </Link>
      <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.02em]">Create New Design System</h2>
      <p className="mt-1 text-sm text-muted">
        Just the basics, then the website to learn from. Everything else is
        optional — the design system is built from what the pages actually show.
      </p>
      <div className="mt-8">
        <ProjectWizard
          clients={clients.map((c) => ({ id: c.id, name: c.name }))}
          defaultClientId={client}
        />
      </div>
    </div>
  );
}
