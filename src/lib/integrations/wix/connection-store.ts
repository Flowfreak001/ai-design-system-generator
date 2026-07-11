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

export function saveWixConnection(projectId: string, agencyId: string, instanceId: string, siteId?: string | null, clientId?: string | null) {
  return prisma.wixConnection.upsert({
    where: { projectId },
    update: { instanceId, siteId: siteId ?? undefined, agencyId, clientId: clientId ?? undefined },
    create: { projectId, agencyId, instanceId, siteId: siteId ?? undefined, clientId: clientId ?? undefined },
  });
}

/** Save just the headless client id for a project (keeps other fields). */
export function saveWixClientId(projectId: string, clientId: string | null) {
  return prisma.wixConnection.update({ where: { projectId }, data: { clientId } });
}

export function deleteWixConnection(projectId: string) {
  return prisma.wixConnection.deleteMany({ where: { projectId } });
}
