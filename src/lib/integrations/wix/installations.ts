// Auto-discover where our Wix app is installed, so users never hunt for an
// "App Instance ID". Uses the app OWNER's account API key (WIX_API_KEY) to call
// Query App Installations, filtered to our app. Server-only.
import { wixConfig } from "./env";

const QUERY_URL = "https://www.wixapis.com/app/installations/v1/app-installation/query";

export type WixInstall = { instanceId: string; siteId?: string; businessName?: string; siteUrl?: string; ownerEmail?: string };

/** Decode the account id from the account-scoped API key (a JWT: IST.<h>.<payload>.<sig>). */
function accountIdFromApiKey(apiKey: string): string | null {
  try {
    const parts = apiKey.split(".");
    const payloadB64 = parts[2] ?? parts[1];
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as { data?: string };
    const data = JSON.parse(payload.data ?? "{}") as { tenant?: { id?: string } };
    return data.tenant?.id ?? null;
  } catch {
    return null;
  }
}

/** List current installs of OUR Wix app across the owner account's sites. */
export async function listAppInstallations(): Promise<WixInstall[]> {
  const appId = process.env.WIX_APP_ID?.trim();
  const { apiKey } = wixConfig();
  const accountId = process.env.WIX_ACCOUNT_ID?.trim() || accountIdFromApiKey(apiKey);
  if (!appId || !accountId) throw new Error("Wix app or account not configured.");

  const res = await fetch(QUERY_URL, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: apiKey, "wix-account-id": accountId },
    body: JSON.stringify({
      query: { filter: { appId, status: "INSTALLED" }, cursorPaging: { limit: 100 } },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Wix installations query failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { appInstallations?: { instanceId: string; siteInfo?: { siteId?: string; businessName?: string; siteUrl?: string; ownerEmail?: string } }[] };
  return (json.appInstallations ?? []).map((a) => ({
    instanceId: a.instanceId,
    siteId: a.siteInfo?.siteId,
    businessName: a.siteInfo?.businessName,
    siteUrl: a.siteInfo?.siteUrl,
    ownerEmail: a.siteInfo?.ownerEmail,
  }));
}
