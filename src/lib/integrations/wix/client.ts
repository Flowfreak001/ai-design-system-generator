// Server-only thin REST client for the Wix Data (CMS) API.
// Auth = API key + Site ID headers (single-account). Endpoints per
// https://dev.wix.com/docs/rest/api-reference/wix-data
import { wixConfig } from "./env";

const ITEMS_URL = "https://www.wixapis.com/wix-data/v2/items";
const SAVE_URL = "https://www.wixapis.com/wix-data/v2/items/save";
const QUERY_URL = "https://www.wixapis.com/wix-data/v2/items/query";
const REMOVE_URL = "https://www.wixapis.com/wix-data/v2/items/remove";
const COLLECTIONS_URL = "https://www.wixapis.com/wix-data/v2/collections";

export type WixField = { key: string; displayName: string; type: "TEXT" | "NUMBER" | "RICH_TEXT" };

function headers() {
  const { apiKey, siteId } = wixConfig();
  return {
    "Content-Type": "application/json",
    Authorization: apiKey,
    "wix-site-id": siteId,
  };
}

async function post(url: string, body: unknown): Promise<{ ok: boolean; status: number; text: string }> {
  const res = await fetch(url, { method: "POST", headers: headers(), body: JSON.stringify(body), cache: "no-store" });
  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, text };
}

/** Insert one item (create-only). Returns the new item id. */
export async function insertDataItem(collectionId: string, data: Record<string, unknown>): Promise<{ id: string }> {
  const r = await post(ITEMS_URL, { dataCollectionId: collectionId, dataItem: { data } });
  if (!r.ok) throw new Error(`Wix insert failed (${r.status}): ${r.text.slice(0, 400)}`);
  const j = JSON.parse(r.text || "{}") as { dataItem?: { id?: string; data?: { _id?: string } } };
  return { id: j.dataItem?.id ?? j.dataItem?.data?._id ?? "(unknown)" };
}

/** Upsert one item by stable id (create if missing, replace if present). */
export async function saveDataItem(collectionId: string, id: string, data: Record<string, unknown>): Promise<void> {
  const r = await post(SAVE_URL, { dataCollectionId: collectionId, dataItem: { id, data } });
  if (!r.ok) throw new Error(`Wix save failed (${r.status}): ${r.text.slice(0, 400)}`);
}

/** Return the ids of all items in a collection matching an equality filter. */
export async function queryItemIds(collectionId: string, filter: Record<string, unknown>): Promise<string[]> {
  const r = await post(QUERY_URL, { dataCollectionId: collectionId, query: { filter, cursorPaging: { limit: 100 } } });
  if (!r.ok) throw new Error(`Wix query failed (${r.status}): ${r.text.slice(0, 400)}`);
  const j = JSON.parse(r.text || "{}") as { dataItems?: { id?: string; data?: { _id?: string } }[] };
  return (j.dataItems ?? []).map((it) => it.id ?? it.data?._id).filter((x): x is string => Boolean(x));
}

/** Remove one item by id. */
export async function removeDataItem(collectionId: string, id: string): Promise<void> {
  const r = await post(REMOVE_URL, { dataCollectionId: collectionId, dataItemId: id });
  if (!r.ok) throw new Error(`Wix remove failed (${r.status}): ${r.text.slice(0, 400)}`);
}

/**
 * Create the collection if it doesn't exist yet. Idempotent — a
 * "collection already exists" response is treated as success.
 */
export async function ensureCollection(id: string, displayName: string, fields: WixField[]): Promise<void> {
  const r = await post(COLLECTIONS_URL, {
    collection: {
      id,
      displayName,
      fields,
      permissions: { insert: "ADMIN", update: "ADMIN", remove: "ADMIN", read: "ANYONE" },
    },
  });
  if (r.ok) return;
  // Already-exists is fine (409, or Wix "WDExxxx ... already exists").
  if (r.status === 409 || /already exist|WDE0074|WDE0025.*exist/i.test(r.text)) return;
  throw new Error(`Wix create-collection failed (${r.status}): ${r.text.slice(0, 400)}`);
}
