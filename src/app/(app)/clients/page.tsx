import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listClients } from "@/lib/clients";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { FadeUp } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

const STAGE_STYLES: Record<string, string> = {
  Onboarding: "bg-accent-soft text-accent border-accent/25",
  Active: "bg-success-soft text-success border-success/25",
  Paused: "bg-warning-soft text-warning border-warning/25",
  Completed: "bg-panel text-muted border-line",
};

export default async function ClientsPage() {
  const user = await requireUser();
  const clients = user.agencyId ? await listClients(user.agencyId) : [];
  const active = clients.filter((c) => c.stage === "Active").length;

  return (
    <div className="px-5 py-8 sm:px-8">
      <PageHeader
        title="Clients"
        description={`${clients.length} ${clients.length === 1 ? "client" : "clients"} · ${active} active`}
        action={<LinkButton href="/clients/new">Add client</LinkButton>}
      />

      {clients.length === 0 ? (
        <FadeUp className="card mt-8 flex flex-col items-center px-6 py-20 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent text-lg">◆</span>
          <h3 className="mt-5 text-lg font-semibold">No clients yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Add your first client — projects, files, and workflows all live
            under the client they belong to.
          </p>
          <LinkButton href="/clients/new" className="mt-6">
            Add your first client
          </LinkButton>
        </FadeUp>
      ) : (
        <FadeUp className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[13px] text-muted">
                <th className="px-5 py-3.5 font-medium">Company</th>
                <th className="px-5 py-3.5 font-medium">Contact</th>
                <th className="px-5 py-3.5 font-medium">Stage</th>
                <th className="px-5 py-3.5 font-medium">Services</th>
                <th className="px-5 py-3.5 font-medium">Projects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.map((c) => (
                <tr key={c.id} className="group relative transition-colors hover:bg-panel/50">
                  <td className="px-5 py-4">
                    <Link href={`/clients/${c.id}`} className="flex items-center gap-3 font-medium text-ink">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-sm font-semibold text-accent">
                        {c.name[0]?.toUpperCase()}
                      </span>
                      <span className="group-hover:text-accent">{c.name}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-ink">{c.contactName ?? "—"}</p>
                    <p className="text-[13px] text-muted">{c.contactEmail ?? ""}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[12px] ${STAGE_STYLES[c.stage] ?? STAGE_STYLES.Onboarding}`}>
                      {c.stage}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {c.services.length ? (
                        c.services.slice(0, 3).map((s) => (
                          <span key={s} className="rounded-full bg-panel px-2 py-0.5 text-[12px] text-body">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                      {c.services.length > 3 && (
                        <span className="text-[12px] text-faint">+{c.services.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-[13px] text-muted tnum">
                    {c._count.projects}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FadeUp>
      )}
    </div>
  );
}
