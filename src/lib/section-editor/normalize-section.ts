// Backward compatibility: give any CanvasSection (old or new) safe editable
// defaults without mutating the original. Old sections keep working; missing
// content/layout/motion/assets are filled in when the drawer (or export) loads.

import type { CanvasSection } from "@/lib/canvas";
import type { EditableSectionData, SectionAsset } from "./types";
import { DEFAULT_LAYOUT, DEFAULT_MOTION, KIND_MOTION_DEFAULT } from "./defaults";
import { getEditSchema } from "./registry";

const uid = () => `ast-${Math.random().toString(36).slice(2, 10)}`;

/** Build the media-role placeholder assets a kind expects (grey by default). */
export function defaultAssetsFor(kind: string): SectionAsset[] {
  return getEditSchema(kind).mediaRoles.map((role) => ({
    id: uid(), role, source: "placeholder", copyrightStatus: "placeholder",
  }));
}

/** Normalize a section's editable data (pure — returns a complete payload). */
export function normalizeSectionData(section: CanvasSection, kind: string): EditableSectionData {
  const content = { ...(section.content ?? {}) };
  // Legacy bridges: name/note/image/icon predate the content model.
  if (content.title === undefined && section.name) content.title = section.name;
  if (content.description === undefined && section.note) content.description = section.note;

  let assets = section.assets ?? [];
  if (assets.length === 0) {
    assets = defaultAssetsFor(kind);
    // Legacy single-image upload becomes the first asset.
    if (section.image && assets[0]) assets = [{ ...assets[0], source: "uploaded", url: section.image }, ...assets.slice(1)];
  }

  return {
    content,
    layout: { ...DEFAULT_LAYOUT, ...(section.asset === "left" ? { assetPlacement: "left" as const } : {}), ...(section.layout ?? {}) },
    motion: { ...(KIND_MOTION_DEFAULT[kind] ?? DEFAULT_MOTION), ...(section.motion ?? {}) },
    assets,
  };
}
