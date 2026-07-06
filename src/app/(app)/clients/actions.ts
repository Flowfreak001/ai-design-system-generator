"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient, ownsClient } from "@/lib/clients";
import { linkProjectToClient } from "@/lib/projects";

export type FormState = { error?: string } | undefined;

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v.trim() : undefined));

const createClientSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  type: optionalText,
  website: optionalText,
  contactName: optionalText,
  contactEmail: optionalText,
  stage: optionalText,
  services: z.array(z.string()).default([]),
});

export async function createClientAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!user.agencyId) return { error: "No agency workspace found." };

  const parsed = createClientSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type") || undefined,
    website: formData.get("website") || undefined,
    contactName: formData.get("contactName") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
    stage: formData.get("stage") || undefined,
    services: formData.getAll("services").map(String),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const client = await createClient(user.agencyId, parsed.data);
  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

/** Attach an existing (unlinked) project to this client. */
export async function linkProjectAction(
  clientId: string,
  projectId: string,
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId) return { error: "No agency workspace found." };
  if (!projectId) return { error: "Select a project to link." };
  if (!(await ownsClient(clientId, user.agencyId))) return { error: "Client not found." };
  try {
    await linkProjectToClient(projectId, clientId, user.agencyId);
  } catch {
    return { error: "Could not link that project." };
  }
  revalidatePath(`/clients/${clientId}`);
  return {};
}
