// Data layer for per-PROJECT Wix connections. Server-only.
import { prisma } from "@/lib/db/client";

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
