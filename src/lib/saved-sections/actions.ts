"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { toggleSaved, removeSaved, type SavedSectionInput } from "./store";

/** Toggle-save a section. Anonymous callers get { needAuth: true }. */
export async function toggleSavedSectionAction(
  input: SavedSectionInput,
): Promise<{ ok: boolean; saved?: boolean; needAuth?: boolean }> {
  const user = await auth();
  if (!user) return { ok: false, needAuth: true };
  const saved = await toggleSaved(user.id, input);
  revalidatePath("/account");
  return { ok: true, saved };
}

/** Remove a saved section (used from the account list). */
export async function removeSavedSectionAction(sectionId: string): Promise<{ ok: boolean; needAuth?: boolean }> {
  const user = await auth();
  if (!user) return { ok: false, needAuth: true };
  await removeSaved(user.id, sectionId);
  revalidatePath("/account");
  return { ok: true };
}
