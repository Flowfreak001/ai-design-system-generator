"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { deleteWixConnection, saveWixConnection } from "@/lib/integrations/wix/connection-store";
import { mintAccessToken } from "@/lib/integrations/wix/oauth";
import { listAppInstallations, type WixInstall } from "@/lib/integrations/wix/installations";

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

export type WixDiscoverState = { error?: string; installs?: WixInstall[] } | undefined;

/** Find the Wix sites where our app is installed, so the user just picks one. */
export async function discoverWixInstallsAction(): Promise<WixDiscoverState> {
  await requireUser();
  try {
    const installs = await listAppInstallations();
    return { installs };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't reach Wix." };
  }
}

/** Connect a specific discovered install (instanceId + siteId) to this agency. */
export async function connectDiscoveredWixAction(instanceId: string, siteId?: string): Promise<WixConnectState> {
  const user = await requireUser();
  if (!user.agencyId) return { error: "No workspace found for your account." };
  if (!instanceId) return { error: "Missing instance id." };
  try {
    await mintAccessToken(instanceId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't verify with Wix." };
  }
  await saveWixConnection(user.agencyId, instanceId, siteId ?? null);
  revalidatePath("/account");
  return { ok: true };
}
