import Link from "next/link";
import { TypeBadge } from "./status-badge";
import { STATUS_STYLES } from "@/lib/status";
import type { DerivedStatus } from "@/types";

export type ProjectCardData = {
  id: string;
  name: string;
  clientName: string | null;
  businessType?: string | null;
  type: string;
  updatedAt: Date;
  fileCount: number;
  hasReferenceUrls: boolean;
  derivedStatus: DerivedStatus;
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <div className="card flex h-full flex-col p-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-ink">{project.name}</h3>
          <p className="mt-0.5 truncate text-sm text-muted">
            {project.clientName || "—"}
            {project.businessType ? ` · ${project.businessType}` : ""}
          </p>
        </div>
        <TypeBadge type={project.type} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide ${STATUS_STYLES[project.derivedStatus]}`}>
          {project.derivedStatus}
        </span>
        {project.hasReferenceUrls ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-panel px-2.5 py-0.5 text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> References added
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-panel px-2.5 py-0.5 text-[11px] text-faint">
            No references yet
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-line pt-4 mt-5">
        <span className="font-mono text-xs text-faint">
          {project.fileCount} files ·{" "}
          {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <Link
          href={`/projects/${project.id}`}
          className="rounded-[10px] border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-line-strong"
        >
          Open Project
        </Link>
      </div>
    </div>
  );
}
