// Server-only thin REST client for the Wix Data (CMS) API.
// Auth = API key + Site ID headers (single-account). Endpoint + shape per
// https://dev.wix.com/docs/rest/api-reference/wix-data/data-items/insert-data-item
import { wixConfig } from "./env";

const WIX_DATA_ITEMS_URL = "https://www.wixapis.com/wix-data/v2/items";

type InsertedItem = { id?: string; data?: Record<string, unknown> & { _id?: string } };

/** Insert one item into an existing Wix Data collection. Returns the new item id. */
export async function insertDataItem(
  collectionId: string,
  data: Record<string, unknown>,
): Promise<{ id: string }> {
  const { apiKey, siteId } = wixConfig();

  const res = await fetch(WIX_DATA_ITEMS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "wix-site-id": siteId,
    },
    body: JSON.stringify({ dataCollectionId: collectionId, dataItem: { data } }),
    // Never cache a write.
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Wix insert failed (${res.status} ${res.statusText})${body ? `: ${body.slice(0, 400)}` : ""}`);
  }

  const json = (await res.json()) as { dataItem?: InsertedItem };
  const id = json.dataItem?.id ?? json.dataItem?.data?._id ?? "(unknown)";
  return { id };
}
