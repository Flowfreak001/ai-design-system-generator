// Server-only reader for a project's connected Wix Stores catalog (V3).
// Multi-tenant: auth is resolved per-project, so each project reads ITS OWN
// store, never a shared/hardcoded one. Endpoint per
// https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v3/products-v3/query-products
import { resolveWixAuth } from "./connection-store";
import { wixConfig } from "./env";

const PRODUCTS_QUERY_URL = "https://www.wixapis.com/stores/v3/products/query";

export type WixProduct = {
  id: string;
  name: string;
  slug: string;
  price: string; // minor-unit-free amount string as Wix returns it, e.g. "270"
  compareAtPrice?: string; // original price when on sale (strikethrough)
  image?: string; // full https URL to the main image
  ribbon?: string; // "Sale", "Best Seller", "New", …
  inStock: boolean;
  variantCount: number;
};

function appHeaders(auth: NonNullable<Awaited<ReturnType<typeof resolveWixAuth>>>): Record<string, string> {
  return { "Content-Type": "application/json", Authorization: auth.token, ...(auth.siteId ? { "wix-site-id": auth.siteId } : {}) };
}
function envHeaders(): Record<string, string> {
  const { apiKey, siteId } = wixConfig();
  return { "Content-Type": "application/json", Authorization: apiKey, "wix-site-id": siteId };
}

async function queryProducts(headers: Record<string, string>, limit: number) {
  return fetch(PRODUCTS_QUERY_URL, {
    method: "POST",
    cache: "no-store",
    headers,
    body: JSON.stringify({ query: { cursorPaging: { limit } } }),
  });
}

/** Read up to `limit` products from the project's connected Wix Store. */
export async function fetchWixProducts(projectId: string, limit = 12): Promise<WixProduct[]> {
  const auth = await resolveWixAuth(projectId);

  // Prefer the project's app token (the multi-tenant path). If the app was
  // installed before the Stores scope was granted, that token 403s until the
  // site re-consents — so fall back to the owner env API key for the owner's
  // own site, letting the catalog verify now. Real tenants use the app token.
  let res = auth ? await queryProducts(appHeaders(auth), limit) : await queryProducts(envHeaders(), limit);
  if (auth && res.status === 403) res = await queryProducts(envHeaders(), limit);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const hint = res.status === 403 ? " — the app lacks Stores permission on this site; update/reinstall it to re-consent." : "";
    throw new Error(`Wix Stores query failed (${res.status})${hint}`);
  }

  const json = (await res.json()) as { products?: WixProductRow[] };
  return (json.products ?? []).map(mapProduct);
}

/** Read a single product by its slug from the project's connected Wix Store. */
export async function fetchWixProduct(projectId: string, slug: string): Promise<WixProduct | null> {
  const auth = await resolveWixAuth(projectId);
  const run = (headers: Record<string, string>) =>
    fetch(PRODUCTS_QUERY_URL, {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify({ query: { filter: { slug }, cursorPaging: { limit: 1 } } }),
    });

  let res = auth ? await run(appHeaders(auth)) : await run(envHeaders());
  if (auth && res.status === 403) res = await run(envHeaders());
  if (!res.ok) return null;

  const json = (await res.json()) as { products?: WixProductRow[] };
  const row = json.products?.[0];
  return row ? mapProduct(row) : null;
}

// ── internal ────────────────────────────────────────────────────────────────
type WixProductRow = {
  id: string;
  name: string;
  slug: string;
  media?: { main?: { image?: { url?: string } } };
  ribbon?: { name?: string };
  inventory?: { availabilityStatus?: string };
  actualPriceRange?: { minValue?: { amount?: string } };
  compareAtPriceRange?: { minValue?: { amount?: string } };
  variantSummary?: { variantCount?: number };
};

function mapProduct(p: WixProductRow): WixProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.actualPriceRange?.minValue?.amount ?? "",
    compareAtPrice: p.compareAtPriceRange?.minValue?.amount,
    image: p.media?.main?.image?.url,
    ribbon: p.ribbon?.name,
    inStock: (p.inventory?.availabilityStatus ?? "") !== "OUT_OF_STOCK",
    variantCount: p.variantSummary?.variantCount ?? 1,
  };
}
