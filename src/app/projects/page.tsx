import Link from "next/link";
import { listProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  RESEARCHING: "bg-blue-100 text-blue-700",
  ANALYZING: "bg-blue-100 text-blue-700",
  GENERATING: "bg-amber-100 text-amber-700",
  READY: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <Link
          href="/projects/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-600">No projects yet.</p>
          <Link
            href="/projects/new"
            className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 hover:border-gray-300 hover:shadow-sm transition"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {p.clientName ? `${p.clientName} · ` : ""}
                    {p._count.files} files · {p._count.referenceUrls} URLs
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
