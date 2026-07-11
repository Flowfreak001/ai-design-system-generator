// Server-only Wix checkout for the hosted storefront. Creates an eCommerce
// checkout from a Stores product, then a Wix headless redirect session, and
// returns the Wix-HOSTED checkout URL to send the visitor to. We never build
// checkout ourselves. Multi-tenant: auth resolves per project.
// Docs:
//  - POST /ecom/v1/checkouts  (create-checkout)
//  - POST /headless/v1/redirect-session  (create-redirect-session)
import { getWixConnection } from "./connection-store";
import { mintVisitorToken } from "./oauth";

const CHECKOUT_URL = "https://www.wixapis.com/ecom/v1/checkouts";
const REDIRECT_URL = "https://www.wixapis.com/headless/v1/redirect-session";
// Fixed Wix Stores app id — required in every Stores catalogReference.
const STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

async function postJson(url: string, body: unknown, headers: Record<string, string>) {
  return fetch(url, { method: "POST", cache: "no-store", headers, body: JSON.stringify(body) });
}

/**
 * Create a checkout for a single product and return the Wix-hosted checkout URL.
 * Uses a VISITOR token from the project's headless client id — the redirect
 * session (Wix-hosted checkout) requires headless visitor identity, not the
 * app-installation token used for catalog reads.
 * `postFlowUrl` must be an allowed redirect domain in the site's Headless settings.
 */
export async function createProductCheckoutUrl(
  projectId: string,
  productId: string,
  quantity: number,
  postFlowUrl: string,
): Promise<{ url: string } | { error: string }> {
  const conn = await getWixConnection(projectId);
  if (!conn?.clientId) {
    return { error: "Checkout needs a Wix Headless client ID — add it in the project's Wix connection." };
  }
  let token: string;
  try {
    token = await mintVisitorToken(conn.clientId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't authenticate a visitor session with Wix." };
  }
  const headers = { "Content-Type": "application/json", Authorization: token };

  const checkoutRes = await postJson(CHECKOUT_URL, {
    lineItems: [{ quantity: Math.max(1, quantity), catalogReference: { catalogItemId: productId, appId: STORES_APP_ID } }],
    channelType: "WEB",
  }, headers);
  if (!checkoutRes.ok) {
    const body = await checkoutRes.text().catch(() => "");
    return { error: `Couldn't create checkout (${checkoutRes.status}). ${body.slice(0, 160)}` };
  }
  const checkoutId = ((await checkoutRes.json()) as { checkout?: { id?: string } }).checkout?.id;
  if (!checkoutId) return { error: "Checkout created without an id." };

  const redirectRes = await postJson(REDIRECT_URL, {
    ecomCheckout: { checkoutId },
    callbacks: { postFlowUrl },
  }, headers);
  if (!redirectRes.ok) {
    const body = await redirectRes.text().catch(() => "");
    return { error: `Couldn't start checkout redirect (${redirectRes.status}). Check allowed redirect domains + a published Wix site. ${body.slice(0, 140)}` };
  }
  const url = ((await redirectRes.json()) as { redirectSession?: { fullUrl?: string } }).redirectSession?.fullUrl;
  return url ? { url } : { error: "No redirect URL returned." };
}
