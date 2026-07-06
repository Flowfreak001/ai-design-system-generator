import type { Metadata } from "next";
import { ClientForm } from "@/components/clients/client-form";

export const metadata: Metadata = { title: "Add client" };

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-8">
      <h2 className="text-center text-[26px] font-semibold tracking-[-0.02em]">Add Client</h2>
      <p className="mx-auto mt-1 max-w-md text-center text-sm text-muted">
        Projects, files, and workflows all live under the client.
      </p>
      <div className="mt-8">
        <ClientForm />
      </div>
    </div>
  );
}
