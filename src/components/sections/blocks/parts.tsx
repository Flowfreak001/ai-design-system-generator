"use client";

// Canvas-editable "parts" for blocks. A section can hide named parts (icon,
// eyebrow, button) from the editor; block primitives read this context and
// render nothing when their part is hidden — the groundwork for element-level
// canvas editing without a full tree rewrite.

import { createContext, useContext } from "react";
import type { CSSProperties, ReactNode } from "react";

export const HiddenParts = createContext<Set<string>>(new Set());
export const useHidden = (part: string): boolean => useContext(HiddenParts).has(part);

// Inline text editing: when a section provides onEditText, primary text slots
// render as click-to-edit (contentEditable) on the canvas — writing back on blur.
export type EditField = "title" | "description";
export const EditText_Ctx = createContext<((field: EditField, value: string) => void) | null>(null);

/** A text slot that becomes inline-editable on the canvas when editing is on. */
export function EditText({ field, as = "span", className, style, children }: {
  field: EditField; as?: "h2" | "h3" | "p" | "span"; className?: string; style?: CSSProperties; children: ReactNode;
}) {
  const onEdit = useContext(EditText_Ctx);
  const Tag = as as "span";
  if (!onEdit) return <Tag className={className} style={style}>{children}</Tag>;
  return (
    <Tag
      className={`${className ?? ""} outline-none focus:ring-2 focus:ring-[var(--color-accent,#6366f1)] focus:ring-offset-2 hover:ring-1 hover:ring-[var(--color-accent,#6366f1)]/40 rounded-[4px] cursor-text`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onBlur={(e) => { const v = e.currentTarget.textContent ?? ""; onEdit(field, v.trim()); }}
      onKeyDown={(e) => { if (e.key === "Enter" && as !== "p") { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); } }}
    >{children}</Tag>
  );
}

/** Editable part keys a block may expose (kept small + shared). */
export const EDITABLE_PARTS: { key: string; label: string }[] = [
  { key: "icon", label: "Icon / circle" },
  { key: "eyebrow", label: "Eyebrow label" },
  { key: "button", label: "Button / link" },
];

// ── Icon slot (canvas shuffle/pick) ──────────────────────────────────────────
// Small curated set of line icons blocks can use. Keys are stored on the section.
export const BLOCK_ICONS: Record<string, ReactNode> = {
  spark: <path d="M12 3v6m0 6v6M3 12h6m6 0h6" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  star: <path d="m12 3 2.9 5.9 6.1.9-4.5 4.4 1 6.1L12 17.8 6.5 20.3l1-6.1L3 9.8l6.1-.9L12 3Z" />,
  heart: <path d="M12 20s-7-4.4-9.2-8.2C1 8.5 2.6 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.4 0 5 3.5 3.2 6.8C19 15.6 12 20 12 20Z" />,
  shield: <path d="M12 3 5 6v6c0 4 3 7 7 8 4-1 7-4 7-8V6l-7-3Z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  rocket: <path d="M5 15c-1 2-1 4-1 4s2 0 4-1m1-3a8 8 0 0 1 2-8c3-3 7-3 7-3s0 4-3 7a8 8 0 0 1-8 2l-1 1-2-2 1-1Z" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5-2 2m-9 9-2 2m0-13 2 2m9 9 2 2" /></>,
  chart: <path d="M5 19V9m7 10V5m7 14v-7" />,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5" />,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  pin: <><path d="M12 21s-6-5-6-10a6 6 0 0 1 12 0c0 5-6 10-6 10Z" /><circle cx="12" cy="11" r="2" /></>,
  chat: <path d="M4 5h16v11H9l-5 4V5Z" />,
  cube: <path d="m12 3 8 4v10l-8 4-8-4V7l8-4Zm0 0v18m8-14-8 4-8-4" />,
};
export const BLOCK_ICON_KEYS = Object.keys(BLOCK_ICONS);
export const nextIconKey = (cur?: string): string => {
  // Unset shows the first icon ("spark"), so advance from index 0 → next icon.
  const i = cur ? BLOCK_ICON_KEYS.indexOf(cur) : 0;
  return BLOCK_ICON_KEYS[(i + 1) % BLOCK_ICON_KEYS.length];
};

export const IconCtx = createContext<{ icon?: string; onEdit?: (k: string) => void }>({});
export const ImageCtx = createContext<{ url?: string; onEdit?: (v: string) => void }>({});
export const useIcon = () => useContext(IconCtx);
export const useImage = () => useContext(ImageCtx);

/** Render a curated block icon by key. */
export function BlockIcon({ k, className = "h-5 w-5", style }: { k?: string; className?: string; style?: CSSProperties }) {
  const path = BLOCK_ICONS[k ?? "spark"] ?? BLOCK_ICONS.spark;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">{path}</svg>;
}

/** Downscale a picked file to a data URL (keeps payloads small). */
export function downscaleImage(file: File, max = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = () => resolve(String(r.result));
      img.src = String(r.result);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
