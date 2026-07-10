"use server";

import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { publishProjectToWix } from "@/lib/integrations/wix/publish";
import { generateWixHeadlessSite, bundleToMarkdown } from "@/lib/integrations/wix/site-generator";

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

export type WixSiteExportResult =
  | { ok: true; filename: string; bundle: string; fileCount: number }
  | { ok: false; error: string };

/** Generate a runnable Next.js + Wix SDK headless-site starter for this project. */
export async function exportWixSiteAction(projectId: string): Promise<WixSiteExportResult> {
  const user = await requireUser();
  if (!user.agencyId) return { ok: false, error: "No workspace found for your account." };

  const project = await getProject(projectId, user.agencyId);
  if (!project) return { ok: false, error: "Project not found." };

  const files = generateWixHeadlessSite({ projectId, projectName: project.name });
  const bundle = bundleToMarkdown(project.name, files);
  const filename = `wix-headless-${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "") || "site"}.md`;
  return { ok: true, filename, bundle, fileCount: files.length };
}
