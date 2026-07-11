"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { deleteWixConnection } from "@/lib/integrations/wix/connection-store";

export async function disconnectWixAction() {
  const user = await requireUser();
  if (user.agencyId) await deleteWixConnection(user.agencyId);
  revalidatePath("/account");
}
