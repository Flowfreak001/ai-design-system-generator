"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { deleteWixConnection, saveWixConnection } from "@/lib/integrations/wix/connection-store";
import { mintAccessToken } from "@/lib/integrations/wix/oauth";

export async function disconnectWixAction() {
  const user = await requireUser();
  if (user.agencyId) await deleteWixConnection(user.agencyId);
  revalidatePath("/account");
}

export type WixConnectState = { error?: string; ok?: boolean } | undefined;

/**
 * Connect a Wix account by its App Instance ID (Client Credentials model — no
 * redirect handshake). We validate by minting a real access token before saving.
 */
export async function connectWixByInstanceAction(_prev: WixConnectState, formData: FormData): Promise<WixConnectState> {
  const user = await requireUser();
  if (!user.agencyId) return { error: "No workspace found for your account." };

  const instanceId = String(formData.get("instanceId") ?? "").trim();
  const siteId = String(formData.get("siteId") ?? "").trim() || null;
  if (!instanceId) return { error: "Enter your Wix App Instance ID." };

  try {
    await mintAccessToken(instanceId); // validates instance id + app credentials
  } catch (e) {
    return { error: e instanceof Error ? `Couldn't verify with Wix: ${e.message}` : "Couldn't verify with Wix." };
  }

  await saveWixConnection(user.agencyId, instanceId, siteId);
  revalidatePath("/account");
  return { ok: true };
}
