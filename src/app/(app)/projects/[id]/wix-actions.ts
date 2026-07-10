"use server";

import { requireUser } from "@/lib/auth";
import { publishProjectToWix } from "@/lib/integrations/wix/publish";

export type WixPublishResult =
  | { ok: true; sections: number; pages: number; collectionId: string }
  | { ok: false; error: string };

/**
 * Publish the project's real content (pages → sections) to the user's Wix CMS.
 * Idempotent — re-publishing upserts, so it won't create duplicates.
 */
export async function publishToWixAction(projectId: string): Promise<WixPublishResult> {
  const user = await requireUser();
  if (!user.agencyId) return { ok: false, error: "No workspace found for your account." };

  try {
    const summary = await publishProjectToWix(projectId, user.agencyId);
    return { ok: true, sections: summary.sections, pages: summary.pages, collectionId: summary.collectionId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Publish to Wix failed." };
  }
}
