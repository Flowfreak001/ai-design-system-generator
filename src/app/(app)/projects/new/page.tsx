import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listClients } from "@/lib/clients";
import { NewProjectChooser } from "@/components/projects/new-project-chooser";

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
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <h2 className="text-[26px] font-semibold tracking-[-0.02em]">Start something new</h2>
      <p className="mt-1 text-sm text-muted">
        Build a live Wix Headless site from a template, or plan a design project.
      </p>
      <div className="mt-8">
        <NewProjectChooser clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  );
}
