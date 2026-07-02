import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getClient } from "@/lib/clients";
import { ProjectCard } from "@/components/projects/project-card";
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

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/clients" className="hover:text-ink">Clients</Link>
        <span className="mx-2 text-faint">/</span>
        <span className="text-ink">{client.name}</span>
      </nav>

      {/* Header */}
      <FadeUp className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-lg font-semibold text-accent">
            {client.name[0]?.toUpperCase()}
          </span>
          <div>
            <h2 className="text-[26px] font-semibold tracking-[-0.02em]">{client.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[12px] ${STAGE_STYLES[client.stage] ?? STAGE_STYLES.Onboarding}`}>
                {client.stage}
              </span>
              {client.type && <span className="text-sm text-muted">{client.type}</span>}
            </div>
          </div>
        </div>
        <LinkButton href={`/projects/new?client=${client.id}`}>+ New project</LinkButton>
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

      {/* Services */}
      {client.services.length > 0 && (
        <div className="mt-6">
          <p className="text-[15px] font-semibold text-ink">Services</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {client.services.map((s) => (
              <span key={s} className="rounded-full border border-success/25 bg-success-soft px-3 py-1 text-sm text-success">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

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
            <LinkButton href={`/projects/new?client=${client.id}`} className="mt-4">
              Create the first project
            </LinkButton>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
