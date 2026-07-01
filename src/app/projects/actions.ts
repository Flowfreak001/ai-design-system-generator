"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProjectSchema } from "@/lib/validators/project";
import { createProject, deleteProject } from "@/lib/projects";
import { startGeneration } from "@/lib/jobs";

export type FormState = { error?: string } | undefined;

/** Create a project from the new-project form, then redirect to its detail page. */
export async function createProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const referenceUrls = String(formData.get("referenceUrls") ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((url) => ({ url, type: "REFERENCE" as const }));

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    clientName: formData.get("clientName") || undefined,
    brief: {
      businessName: formData.get("businessName") || formData.get("name"),
      industry: formData.get("industry") || undefined,
      audience: formData.get("audience") || undefined,
      notes: formData.get("notes") || undefined,
    },
    referenceUrls,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const project = await createProject(parsed.data);
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function generateAction(projectId: string) {
  // Enqueues a GENERATE job. Runs inline when there's no Redis, or via the
  // BullMQ worker when REDIS_URL is set.
  await startGeneration(projectId);
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProjectAction(projectId: string) {
  await deleteProject(projectId);
  revalidatePath("/projects");
  redirect("/projects");
}
