"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser, auth, createSession } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export type ProfileState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(80, "Name is too long."),
  agencyName: z.string().trim().max(80, "Workspace name is too long.").optional(),
});

export async function updateProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    name: formData.get("name"),
    agencyName: formData.get("agencyName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const { name, agencyName } = parsed.data;

  try {
    await prisma.user.update({ where: { id: user.id }, data: { name } });
    if (user.agencyId && agencyName) {
      await prisma.agency.update({ where: { id: user.agencyId }, data: { name: agencyName } });
    }
  } catch {
    return { error: "Could not save your profile. Please try again." };
  }

  // Refresh the session cookie so the new name shows everywhere immediately.
  const current = await auth();
  if (current) await createSession({ ...current, name });

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { ok: true };
}
