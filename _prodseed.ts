import { prisma } from "./src/lib/db/client";
import { seedBuiltinsForAgency } from "./src/lib/section-library/builtin-seeds";
(async () => {
  const before = await prisma.librarySection.count();
  const del = await prisma.librarySection.deleteMany({});
  console.log("existing rows:", before, "→ deleted:", del.count);
  const agencies = await prisma.agency.findMany({ select: { id: true, name: true } });
  for (const a of agencies) await seedBuiltinsForAgency(a.id);
  const after = await prisma.librarySection.count();
  console.log("agencies seeded:", agencies.length, "| rows now:", after);
  await prisma.$disconnect();
})();
