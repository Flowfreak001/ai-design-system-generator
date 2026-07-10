// Wix integration config — server-only. Reads the single-account API-key creds
// used for the Publish-to-Wix smoke test (no OAuth yet). Mirrors how OPENAI_API_KEY
// is consumed: plain process.env, kept out of components.
export type WixConfig = { apiKey: string; siteId: string; collectionId: string };

/** Returns the Wix creds, or throws a clear, user-facing error if unset. */
export function wixConfig(): WixConfig {
  const apiKey = process.env.WIX_API_KEY?.trim();
  const siteId = process.env.WIX_SITE_ID?.trim();
  const collectionId = process.env.WIX_COLLECTION_ID?.trim() || "Services";
  if (!apiKey || !siteId) {
    throw new Error("Wix is not configured — set WIX_API_KEY and WIX_SITE_ID in the environment.");
  }
  return { apiKey, siteId, collectionId };
}
