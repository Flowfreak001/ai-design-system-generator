// Data layer for per-PROJECT Wix connections. Server-only.
import { prisma } from "@/lib/db/client";
import { mintAccessToken } from "./oauth";
import type { WixAuth } from "./client";

/**
 * Resolve how to authenticate Wix calls FOR A PROJECT: prefer the project's own
 * connected Wix account (app OAuth token, scoped to that site); fall back to the
 * single-account env API key (auth = undefined) when no connection exists.
 * This is the tenant boundary — one project's calls never hit another's site.
 */
export async function resolveWixAuth(projectId: string): Promise<WixAuth | undefined> {
  const conn = await getWixConnection(projectId);
  if (!conn) return undefined;
  return { token: await mintAccessToken(conn.instanceId), siteId: conn.siteId };
}

export function getWixConnection(projectId: string) {
  return prisma.wixConnection.findUnique({ where: { projectId } });
}

export function saveWixConnection(projectId: string, agencyId: string, instanceId: string, siteId?: string | null) {
  return prisma.wixConnection.upsert({
    where: { projectId },
    update: { instanceId, siteId: siteId ?? undefined, agencyId },
    create: { projectId, agencyId, instanceId, siteId: siteId ?? undefined },
  });
}

export function deleteWixConnection(projectId: string) {
  return prisma.wixConnection.deleteMany({ where: { projectId } });
}
