// Server-only Wix checkout for the hosted storefront. Creates an eCommerce
// checkout from a Stores product, then a Wix headless redirect session, and
// returns the Wix-HOSTED checkout URL to send the visitor to. We never build
// checkout ourselves. Multi-tenant: auth resolves per project.
// Docs:
//  - POST /ecom/v1/checkouts  (create-checkout)
//  - POST /headless/v1/redirect-session  (create-redirect-session)
import { resolveWixAuth } from "./connection-store";
import { wixConfig } from "./env";

const CHECKOUT_URL = "https://www.wixapis.com/ecom/v1/checkouts";
const REDIRECT_URL = "https://www.wixapis.com/headless/v1/redirect-session";
// Fixed Wix Stores app id — required in every Stores catalogReference.
const STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

async function authedHeaders(projectId: string): Promise<{ headers: Record<string, string>; fallback?: Record<string, string> }> {
  const auth = await resolveWixAuth(projectId);
  const env = () => { const { apiKey, siteId } = wixConfig(); return { "Content-Type": "application/json", Authorization: apiKey, "wix-site-id": siteId }; };
  if (!auth) return { headers: env() };
  return {
    headers: { "Content-Type": "application/json", Authorization: auth.token, ...(auth.siteId ? { "wix-site-id": auth.siteId } : {}) },
    fallback: env(),
  };
}

async function postJson(url: string, body: unknown, h: { headers: Record<string, string>; fallback?: Record<string, string> }) {
  let res = await fetch(url, { method: "POST", cache: "no-store", headers: h.headers, body: JSON.stringify(body) });
  if (res.status === 403 && h.fallback) res = await fetch(url, { method: "POST", cache: "no-store", headers: h.fallback, body: JSON.stringify(body) });
  return res;
}

/**
 * Create a checkout for a single product and return the Wix-hosted checkout URL.
 * `postFlowUrl` is where Wix returns the visitor after checkout (must be an
 * allowed redirect domain in the site's Headless settings).
 */
export async function createProductCheckoutUrl(
  projectId: string,
  productId: string,
  quantity: number,
  postFlowUrl: string,
): Promise<{ url: string } | { error: string }> {
  const h = await authedHeaders(projectId);

  const checkoutRes = await postJson(CHECKOUT_URL, {
    lineItems: [{ quantity: Math.max(1, quantity), catalogReference: { catalogItemId: productId, appId: STORES_APP_ID } }],
    channelType: "WEB",
  }, h);
  if (!checkoutRes.ok) {
    const body = await checkoutRes.text().catch(() => "");
    if (checkoutRes.status === 403) return { error: "The app lacks eCommerce permission on this site — update/reinstall it to re-consent." };
    return { error: `Couldn't create checkout (${checkoutRes.status}). ${body.slice(0, 160)}` };
  }
  const checkoutId = ((await checkoutRes.json()) as { checkout?: { id?: string } }).checkout?.id;
  if (!checkoutId) return { error: "Checkout created without an id." };

  const redirectRes = await postJson(REDIRECT_URL, {
    ecomCheckout: { checkoutId },
    callbacks: { postFlowUrl },
  }, h);
  if (!redirectRes.ok) {
    const body = await redirectRes.text().catch(() => "");
    return { error: `Couldn't start checkout redirect (${redirectRes.status}). Check allowed redirect domains + a published Wix site. ${body.slice(0, 140)}` };
  }
  const url = ((await redirectRes.json()) as { redirectSession?: { fullUrl?: string } }).redirectSession?.fullUrl;
  return url ? { url } : { error: "No redirect URL returned." };
}
