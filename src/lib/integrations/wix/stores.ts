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

/** Read up to `limit` products from the project's connected Wix Store. */
export async function fetchWixProducts(projectId: string, limit = 12): Promise<WixProduct[]> {
  const auth = await resolveWixAuth(projectId);
  const headers: Record<string, string> = auth
    ? { "Content-Type": "application/json", Authorization: auth.token, ...(auth.siteId ? { "wix-site-id": auth.siteId } : {}) }
    : (() => { const { apiKey, siteId } = wixConfig(); return { "Content-Type": "application/json", Authorization: apiKey, "wix-site-id": siteId }; })();

  const res = await fetch(PRODUCTS_QUERY_URL, {
    method: "POST",
    cache: "no-store",
    headers,
    body: JSON.stringify({ query: { cursorPaging: { limit } } }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Wix Stores query failed (${res.status}): ${body.slice(0, 240)}`);
  }

  const json = (await res.json()) as { products?: WixProductRow[] };
  return (json.products ?? []).map(mapProduct);
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
