import Link from "next/link";
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
    <div className="px-5 py-8 sm:px-8">
      <Link href="/projects" className="text-sm text-muted transition-colors hover:text-ink">
        ← Projects
      </Link>
      <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.02em]">Start a website</h2>
      <p className="mt-1 text-sm text-muted">
        Name it and (optionally) point us at a site to learn from — we build the
        pages, sections and brand for you. Everything else is optional.
      </p>
      <div className="mt-8">
        <QuickStart clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  );
}
