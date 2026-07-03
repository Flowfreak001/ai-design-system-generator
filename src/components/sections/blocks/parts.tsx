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
