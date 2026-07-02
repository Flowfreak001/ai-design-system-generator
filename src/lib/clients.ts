// Data-access for clients (Business records) — agency-first: every client
// belongs to the agency, and projects hang off clients.

import { prisma } from "@/lib/db/client";

export { CLIENT_STAGES, CLIENT_SERVICES } from "./clients-constants";

export async function listClients(agencyId: string) {
  return prisma.business.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { projects: true } } },
  });
}

export async function getClient(id: string, agencyId: string) {
  return prisma.business.findUnique({
    where: { id, agencyId },
    include: {
      projects: {
        orderBy: { updatedAt: "desc" },
        include: {
          inputs: { where: { category: "brief" } },
          files: { select: { name: true, type: true } },
          _count: { select: { files: true, workflows: true } },
        },
      },
      _count: { select: { leads: true } },
    },
  });
}

export async function createClient(
  agencyId: string,
  data: {
    name: string;
    type?: string;
    website?: string;
    contactName?: string;
    contactEmail?: string;
    stage?: string;
    services: string[];
  },
) {
  return prisma.business.create({ data: { agencyId, ...data } });
}

export async function ownsClient(id: string, agencyId: string): Promise<boolean> {
  const found = await prisma.business.findUnique({ where: { id, agencyId }, select: { id: true } });
  return Boolean(found);
}
