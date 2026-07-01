import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjectFile } from "@/lib/projects";
import { generateAction, deleteProjectAction } from "../actions";
import type { BusinessBrief } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ file?: string }>;
}) {
  const { id } = await params;
  const { file: selectedName } = await searchParams;

  const project = await getProject(id);
  if (!project) notFound();

  const brief = (project.businessDetails as BusinessBrief | null) ?? null;
  const selected = selectedName ? await getProjectFile(id, selectedName) : null;

  const generate = generateAction.bind(null, id);
  const remove = deleteProjectAction.bind(null, id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-900">
        ← Projects
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {project.clientName ? `${project.clientName} · ` : ""}
            <span className="font-mono">{project.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={generate}>
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
              {project.files.length > 0 ? "Regenerate files" : "Generate files"}
            </button>
          </form>
          <form action={remove}>
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:border-red-300 hover:text-red-700">
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Brief */}
      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <Info label="Business" value={brief?.businessName} />
        <Info label="Industry" value={brief?.industry} />
        <Info label="Audience" value={brief?.audience} />
        <Info label="Notes" value={brief?.notes} />
      </section>

      {project.referenceUrls.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Reference URLs
          </h2>
          <ul className="mt-2 grid gap-1 font-mono text-sm text-indigo-700">
            {project.referenceUrls.map((u) => (
              <li key={u.id}>{u.url}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Generated files */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Generated files ({project.files.length})
        </h2>

        {project.files.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            No files yet — click <span className="font-medium">Generate files</span> to
            produce the design system.
          </p>
        ) : (
          <div className="mt-3 grid gap-6 lg:grid-cols-[240px_1fr]">
            <ul className="grid h-fit gap-0.5 rounded-lg border border-gray-200 bg-white p-2">
              {project.files.map((f) => {
                const active = f.name === selectedName;
                return (
                  <li key={f.id}>
                    <Link
                      href={`/projects/${id}?file=${encodeURIComponent(f.name)}`}
                      className={`block rounded px-3 py-1.5 font-mono text-xs ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {f.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="min-w-0 rounded-lg border border-gray-200 bg-white">
              {selected ? (
                <>
                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
                    <span className="font-mono text-xs text-gray-600">{selected.name}</span>
                    <span className="font-mono text-[11px] text-gray-400">
                      {selected.mimeType}
                    </span>
                  </div>
                  <pre className="max-h-[520px] overflow-auto p-4 text-xs leading-relaxed text-gray-800">
                    {selected.content}
                  </pre>
                </>
              ) : (
                <p className="p-8 text-center text-sm text-gray-500">
                  Select a file to preview its contents.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value || "—"}</p>
    </div>
  );
}
