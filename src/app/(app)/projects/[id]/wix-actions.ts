"use server";

import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { insertDataItem } from "@/lib/integrations/wix/client";
import { wixConfig } from "@/lib/integrations/wix/env";

export type WixPublishResult =
  | { ok: true; itemId: string; collectionId: string }
  | { ok: false; error: string };

/**
 * Smoke test: push one item derived from the project into the user's Wix CMS
 * collection so we can confirm the end-to-end pipe (button → live Wix write).
 */
export async function publishToWixAction(projectId: string): Promise<WixPublishResult> {
  const user = await requireUser();
  if (!user.agencyId) return { ok: false, error: "No workspace found for your account." };

  const project = await getProject(projectId, user.agencyId);
  if (!project) return { ok: false, error: "Project not found." };

  try {
    const { collectionId } = wixConfig();
    const { id } = await insertDataItem(collectionId, {
      name: project.name || project.clientName || "Untitled project",
      price: "Published from Flowfreak",
    });
    return { ok: true, itemId: id, collectionId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Publish to Wix failed." };
  }
}
