// Data layer for per-agency Wix connections. Server-only.
import { prisma } from "@/lib/db/client";

export function getWixConnection(agencyId: string) {
  return prisma.wixConnection.findUnique({ where: { agencyId } });
}

export function saveWixConnection(agencyId: string, instanceId: string, siteId?: string | null) {
  return prisma.wixConnection.upsert({
    where: { agencyId },
    update: { instanceId, siteId: siteId ?? undefined },
    create: { agencyId, instanceId, siteId: siteId ?? undefined },
  });
}

export function deleteWixConnection(agencyId: string) {
  return prisma.wixConnection.deleteMany({ where: { agencyId } });
}
