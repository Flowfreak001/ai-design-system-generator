import Link from "next/link";
import { StatusBadge } from "./status-badge";

export type ProjectCardData = {
  id: string;
  name: string;
  clientName: string | null;
  businessType: string | null;
  status: string;
  createdAt: Date;
  _count: { files: number };
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="card group block p-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{project.name}</h3>
          <p className="mt-1 truncate text-sm text-muted">
            {project.clientName || project.businessType || "Untitled client"}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4 font-mono text-xs text-faint">
        <span>{project._count.files} files</span>
        <span>
          {new Date(project.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
}
