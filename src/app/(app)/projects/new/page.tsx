import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listClients } from "@/lib/clients";
import { QuickStart } from "@/components/projects/quick-start";

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
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
      <h2 className="text-center text-[26px] font-semibold tracking-[-0.02em]">Start a website</h2>
      <p className="mx-auto mt-1 max-w-md text-center text-sm text-muted">
        Name your website to get started.
      </p>
      <div className="mt-8">
        <QuickStart clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  );
}
