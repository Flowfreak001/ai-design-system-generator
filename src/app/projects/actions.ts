"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProjectSchema } from "@/lib/validators/project";
import { createProject, deleteProject } from "@/lib/projects";
import { startGeneration } from "@/lib/jobs";

export type FormState = { error?: string } | undefined;

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : undefined;
};

export async function createProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createProjectSchema.safeParse({
    name: str(formData, "name"),
    clientName: str(formData, "clientName"),
    businessName: str(formData, "businessName"),
    businessType: str(formData, "businessType"),
    websiteGoal: str(formData, "websiteGoal"),
    targetAudience: str(formData, "targetAudience"),
    existingWebsiteUrl: str(formData, "existingWebsiteUrl"),
    referenceUrls: str(formData, "referenceUrls"),
    competitorUrls: str(formData, "competitorUrls"),
    brandColors: str(formData, "brandColors"),
    requiredPages: str(formData, "requiredPages"),
    servicesProducts: str(formData, "servicesProducts"),
    seoKeywords: str(formData, "seoKeywords"),
    platformTarget: str(formData, "platformTarget"),
    animationPreference: str(formData, "animationPreference"),
    notes: str(formData, "notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const project = await createProject(parsed.data);
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function generateAction(projectId: string) {
  // Inline when no Redis; BullMQ worker when REDIS_URL is set.
  await startGeneration(projectId);
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProjectAction(projectId: string) {
  await deleteProject(projectId);
  revalidatePath("/projects");
  redirect("/projects");
}
