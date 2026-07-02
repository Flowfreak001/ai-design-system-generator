import Link from "next/link";
import type { Metadata } from "next";
import { ClientForm } from "@/components/clients/client-form";

export const metadata: Metadata = { title: "Add client" };

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-8">
      <Link href="/clients" className="text-sm text-muted transition-colors hover:text-ink">
        ← Clients
      </Link>
      <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.02em]">Add Client</h2>
      <p className="mt-1 text-sm text-muted">
        Projects, files, and workflows all live under the client they belong to.
      </p>
      <div className="mt-8">
        <ClientForm />
      </div>
    </div>
  );
}
