"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProjectSchema, createNoteSchema } from "@/lib/validators/project";
import { createProject, deleteProject, addNote, ownsProject } from "@/lib/projects";
import { startGeneration } from "@/lib/jobs";
import { requireUser } from "@/lib/auth";

export type FormState = { error?: string } | undefined;

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : undefined;
};

export async function createProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = createProjectSchema.safeParse({
    name: str(formData, "name"),
    businessId: str(formData, "businessId"),
    clientName: str(formData, "clientName"),
    type: str(formData, "type"),
    businessType: str(formData, "businessType"),
    goal: str(formData, "goal"),
    targetAudience: str(formData, "targetAudience"),
    keyItems: str(formData, "keyItems"),
    brandRefs: str(formData, "brandRefs"),
    currentTools: str(formData, "currentTools"),
    notes: str(formData, "notes"),
    currentProcess: str(formData, "currentProcess"),
    mainPainPoint: str(formData, "mainPainPoint"),
    triggerSource: str(formData, "triggerSource"),
    aiShouldDo: str(formData, "aiShouldDo"),
    needsHumanApproval: str(formData, "needsHumanApproval"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const project = await createProject(parsed.data, user.agencyId ?? undefined);
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function generateAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return;
  await startGeneration(projectId);
  revalidatePath(`/projects/${projectId}`);
}

export async function addNoteAction(
  projectId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) {
    return { error: "Not allowed" };
  }
  const parsed = createNoteSchema.safeParse({
    projectId,
    title: str(formData, "title"),
    content: str(formData, "content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid note" };
  }
  await addNote(parsed.data.projectId, parsed.data.content, parsed.data.title);
  revalidatePath(`/projects/${projectId}`);
  return undefined;
}

export async function deleteProjectAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId) return;
  await deleteProject(projectId, user.agencyId);
  revalidatePath("/projects");
  redirect("/projects");
}
