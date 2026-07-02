import Link from "next/link";
import type { Metadata } from "next";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 pt-28 md:pt-32 pb-24">
      <Link href="/projects" className="text-sm text-muted transition-colors hover:text-ink">
        ← Projects
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">New project</h1>
      <p className="mt-2 text-muted">
        Pick a project type and capture the brief — the generated files and
        workflow blueprint are built from what you enter here.
      </p>

      <div className="mt-10">
        <ProjectForm />
      </div>
    </div>
  );
}
