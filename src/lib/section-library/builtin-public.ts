// Pure (no DB, no auth) accessor for the platform's built-in Section Library.
// Maps builtin-sections.json → LibrarySection[] so the PUBLIC /components page
// can show the exact same catalog the authenticated app seeds per-agency.

import BUILTIN_SECTIONS from "./builtin-sections.json";
import { slugify, dynamicToLibrarySection, type DynamicSectionDef } from "./dynamic-section";
import type { LibrarySection, SectionLibraryCategory } from "./manual-sections";

type BuiltinSection = {
  id: string; name: string; category: string; categories?: string[]; layoutType: string; description: string;
  tags: string[]; editableFields: string[]; codeMode: string; originality: string;
  defaultContent: unknown; tsxCode: string;
};

const EPOCH = new Date(0).toISOString();

/** All built-in sections as read-only LibrarySections (public catalog). */
export function getBuiltinLibrarySections(): LibrarySection[] {
  return (BUILTIN_SECTIONS as unknown as BuiltinSection[]).map((b) => {
    const def: DynamicSectionDef = {
      id: `builtin-${b.id}`,
      name: b.name,
      slug: slugify(b.name),
      category: b.category as SectionLibraryCategory,
      categories: (b.categories as SectionLibraryCategory[] | undefined),
      layoutType: b.layoutType,
      description: b.description,
      tags: b.tags ?? [],
      sourceType: "admin",
      visibility: "public",
      createdByUserId: null,
      version: 1,
      componentCode: b.tsxCode,
      codeMode: b.codeMode === "html-css" ? "html" : "react",
      defaultContent: (b.defaultContent ?? {}) as DynamicSectionDef["defaultContent"],
      editableFields: b.editableFields ?? [],
      originalityRule: b.originality || "Original design — placeholder media only.",
      status: "ready",
      createdAt: EPOCH,
      updatedAt: EPOCH,
    };
    return { ...dynamicToLibrarySection(def), origin: "builtin" as const };
  });
}
