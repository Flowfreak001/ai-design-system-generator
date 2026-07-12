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
      {/* The chooser renders its own step heading (choose step only), so no
          duplicate title here. */}
      <NewProjectChooser clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
