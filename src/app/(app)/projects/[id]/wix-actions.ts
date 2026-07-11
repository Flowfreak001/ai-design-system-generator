"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { publishProjectToWix } from "@/lib/integrations/wix/publish";
import { generateWixHeadlessSite, bundleToMarkdown } from "@/lib/integrations/wix/site-generator";
import { listAppInstallations, type WixInstall } from "@/lib/integrations/wix/installations";
import { mintAccessToken } from "@/lib/integrations/wix/oauth";
import { saveWixConnection, deleteWixConnection } from "@/lib/integrations/wix/connection-store";

export type WixPublishResult =
  | { ok: true; sections: number; pages: number; collectionId: string; removed: number }
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
    return { ok: true, sections: summary.sections, pages: summary.pages, collectionId: summary.collectionId, removed: summary.removed };
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

// ── Per-project Wix connection ─────────────────────────────────────────────
export type WixDiscoverState = { error?: string; installs?: WixInstall[] } | undefined;
export type WixConnectState = { error?: string; ok?: boolean } | undefined;

/** Find the Wix sites where our app is installed, so the user just picks one. */
export async function discoverWixInstallsAction(): Promise<WixDiscoverState> {
  await requireUser();
  try {
    return { installs: await listAppInstallations() };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't reach Wix." };
  }
}

/** Connect a chosen Wix site to THIS project (verifies by minting a token). */
export async function connectWixToProjectAction(projectId: string, instanceId: string, siteId?: string): Promise<WixConnectState> {
  const user = await requireUser();
  if (!user.agencyId) return { error: "No workspace found for your account." };
  const project = await getProject(projectId, user.agencyId);
  if (!project) return { error: "Project not found." };
  if (!instanceId) return { error: "Missing instance id." };
  try {
    await mintAccessToken(instanceId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't verify with Wix." };
  }
  await saveWixConnection(projectId, user.agencyId, instanceId, siteId ?? null);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

/** Disconnect this project's Wix site. */
export async function disconnectWixFromProjectAction(projectId: string): Promise<void> {
  const user = await requireUser();
  if (!user.agencyId) return;
  const project = await getProject(projectId, user.agencyId);
  if (project) await deleteWixConnection(projectId);
  revalidatePath(`/projects/${projectId}`);
}
