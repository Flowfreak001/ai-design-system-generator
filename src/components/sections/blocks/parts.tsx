"use client";

// Canvas-editable "parts" for blocks. A section can hide named parts (icon,
// eyebrow, button) from the editor; block primitives read this context and
// render nothing when their part is hidden — the groundwork for element-level
// canvas editing without a full tree rewrite.

import { createContext, useContext } from "react";

export const HiddenParts = createContext<Set<string>>(new Set());
export const useHidden = (part: string): boolean => useContext(HiddenParts).has(part);

/** Editable part keys a block may expose (kept small + shared). */
export const EDITABLE_PARTS: { key: string; label: string }[] = [
  { key: "icon", label: "Icon / circle" },
  { key: "eyebrow", label: "Eyebrow label" },
  { key: "button", label: "Button / link" },
];
