import Link from "next/link";
import { StatusBadge, TypeBadge } from "./status-badge";

export type ProjectCardData = {
  id: string;
  name: string;
  clientName: string | null;
  type: string;
  status: string;
  updatedAt: Date;
  _count: { files: number; workflows: number };
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="card group block p-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{project.name}</h3>
          <p className="mt-1 truncate text-sm text-muted">
            {project.clientName || "Untitled client"}
          </p>
        </div>
        <TypeBadge type={project.type} />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <StatusBadge status={project.status} />
        <span className="font-mono text-xs text-faint">
          {project._count.files} files
          {project._count.workflows > 0 ? ` · ${project._count.workflows} workflow` : ""}
          {" · "}
          {new Date(project.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
}
