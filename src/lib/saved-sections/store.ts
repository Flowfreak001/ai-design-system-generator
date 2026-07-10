// Data layer for user-saved (bookmarked) library sections. Server-only.
import { prisma } from "@/lib/db/client";
import { builtinSectionKey } from "./key";

export type SavedSectionInput = { sectionId: string; name: string; category: string };

/** Section ids the user has saved (for quick "is saved" checks). */
export async function listSavedIds(userId: string): Promise<string[]> {
  const rows = await prisma.savedSection.findMany({ where: { userId }, select: { sectionId: true } });
  return rows.map((r) => r.sectionId);
}

/** Full saved rows, newest first (for the account list). */
export async function listSaved(userId: string) {
  return prisma.savedSection.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

/** Toggle a save. Returns the new saved state (true = now saved). */
export async function toggleSaved(userId: string, s: SavedSectionInput): Promise<boolean> {
  // Normalize to the built-in id so /library and /components share one saved key.
  const sectionId = builtinSectionKey(s.sectionId);
  const existing = await prisma.savedSection.findUnique({
    where: { userId_sectionId: { userId, sectionId } },
  });
  if (existing) {
    await prisma.savedSection.delete({ where: { id: existing.id } });
    return false;
  }
  await prisma.savedSection.create({ data: { userId, sectionId, name: s.name, category: s.category } });
  return true;
}

export async function removeSaved(userId: string, sectionId: string): Promise<void> {
  await prisma.savedSection.deleteMany({ where: { userId, sectionId: builtinSectionKey(sectionId) } });
}
