import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getClient } from "@/lib/clients";
import { listUnlinkedProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/projects/project-card";
import { LinkProject } from "@/components/clients/link-project";
import { deriveStatus } from "@/lib/status";
import type { ProjectBrief } from "@/types";
import { LinkButton } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

const STAGE_STYLES: Record<string, string> = {
  Onboarding: "bg-accent-soft text-accent border-accent/25",
  Active: "bg-success-soft text-success border-success/25",
  Paused: "bg-warning-soft text-warning border-warning/25",
  Completed: "bg-panel text-muted border-line",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  if (!user.agencyId) notFound();
  const client = await getClient(id, user.agencyId);
  if (!client) notFound();
  const unlinked = await listUnlinkedProjects(user.agencyId);

  return (
    <div className="px-5 py-8 sm:px-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/clients" className="hover:text-ink">Clients</Link>
        <span className="mx-2 text-faint">/</span>
        <span className="text-ink">{client.name}</span>
      </nav>

      {/* Header — clean surface pill (matches the Section Library header),
          with services shown inline beside the company name. */}
      <FadeUp className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-sm">
          <div className="pr-1">
            <h2 className="text-[18px] font-semibold leading-tight tracking-[-0.01em] text-ink">{client.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${STAGE_STYLES[client.stage] ?? STAGE_STYLES.Onboarding}`}>
                {client.stage}
              </span>
              {client.type && <span className="text-[12.5px] text-muted">{client.type}</span>}
            </div>
          </div>
          {client.services.length > 0 && (
            <>
              <span className="hidden h-8 w-px bg-line sm:block" />
              <div className="flex flex-wrap items-center gap-1.5">
                {client.services.map((s) => (
                  <span key={s} className="rounded-full border border-success/25 bg-success-soft px-2.5 py-1 text-[12.5px] font-medium text-success">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LinkProject clientId={client.id} options={unlinked} />
          <LinkButton href={`/projects/new?client=${client.id}`}>+ New project</LinkButton>
        </div>
      </FadeUp>

      {/* Contact cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <InfoCard label="Contact" value={client.contactName ?? "—"} />
        <InfoCard label="Email" value={client.contactEmail ?? "—"} mono />
        <InfoCard
          label="Website"
          value={client.website ?? "—"}
          href={client.website ?? undefined}
          mono
        />
      </div>

      {/* Projects under this client */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Projects <span className="font-mono text-sm text-faint">({client.projects.length})</span>
          </h3>
        </div>
        {client.projects.length === 0 ? (
          <div className="card mt-4 flex flex-col items-center px-6 py-14 text-center">
            <p className="text-sm text-muted">No projects for this client yet.</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <LinkProject clientId={client.id} options={unlinked} />
              <LinkButton href={`/projects/new?client=${client.id}`}>
                Create the first project
              </LinkButton>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {client.projects.map((p) => {
              const brief = (p.inputs[0]?.data ?? {}) as Partial<ProjectBrief>;
              const hasReferenceUrls = Boolean(
                brief.referenceUrls?.length || brief.existingWebsiteUrl || brief.competitorUrls?.length,
              );
              return (
                <ProjectCard
                  key={p.id}
                  project={{
                    id: p.id,
                    name: p.name,
                    clientName: p.clientName,
                    businessType: brief.businessType ?? null,
                    type: p.type,
                    updatedAt: p.updatedAt,
                    fileCount: p._count.files,
                    hasReferenceUrls,
                    derivedStatus: deriveStatus({ status: p.status, files: p.files, hasReferenceUrls }),
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  href,
  mono,
}: {
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
}) {
  const content = href ? (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
      {value}
    </a>
  ) : (
    value
  );
  return (
    <div className="card px-5 py-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-faint">{label}</p>
      <p className={`mt-1.5 truncate text-[15px] text-ink ${mono ? "font-mono text-sm" : ""}`}>{content}</p>
    </div>
  );
}
