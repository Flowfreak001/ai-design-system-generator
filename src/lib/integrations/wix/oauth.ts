// Wix App OAuth — server-only. Lets each Flowfreak agency connect their OWN Wix
// account by installing our Wix app, then mint short-lived access tokens with
// client_credentials + the stored instanceId.
// Docs: https://dev.wix.com/docs/build-apps/develop-your-app/access/authentication/authenticate-using-oauth
const TOKEN_URL = "https://www.wixapis.com/oauth2/token";
const INSTALL_URL = "https://www.wix.com/installer/install";

export type WixAppConfig = { appId: string; appSecret: string; callbackUrl: string };

export function wixAppConfig(): WixAppConfig {
  const appId = process.env.WIX_APP_ID?.trim();
  const appSecret = process.env.WIX_APP_SECRET?.trim();
  const callbackUrl = process.env.WIX_APP_CALLBACK_URL?.trim();
  if (!appId || !appSecret || !callbackUrl) {
    throw new Error("Wix app not configured — set WIX_APP_ID, WIX_APP_SECRET, WIX_APP_CALLBACK_URL.");
  }
  return { appId, appSecret, callbackUrl };
}

export function isWixAppConfigured(): boolean {
  return Boolean(process.env.WIX_APP_ID && process.env.WIX_APP_SECRET && process.env.WIX_APP_CALLBACK_URL);
}

/** URL to send the user to so they install/authorize our app on their Wix site. */
export function wixInstallUrl(state: string): string {
  const { appId, callbackUrl } = wixAppConfig();
  const p = new URLSearchParams({ appId, redirectUrl: callbackUrl, state });
  return `${INSTALL_URL}?${p.toString()}`;
}

/** Mint a fresh app access token for a connected site (valid ~4h). */
export async function mintAccessToken(instanceId: string): Promise<string> {
  const { appId, appSecret } = wixAppConfig();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: appId,
      client_secret: appSecret,
      instance_id: instanceId,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Wix token mint failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Wix token response missing access_token.");
  return json.access_token;
}
