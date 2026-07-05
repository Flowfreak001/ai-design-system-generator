// Admin-authored, component-based sections (Phase 1 of the component library).
//
// Admins create sections from real React/TSX component code. The definition
// carries metadata, default content, editable fields, category/tags, an
// originality rule, and a review status. Only `ready` definitions are exposed to
// users (safety rule). Persisted per-project as ADMIN_SECTIONS.json for now;
// promoting to a global catalog table is the next step (see report notes).

import type {
  SectionLibraryCategory, SectionLibraryStatus,
  LibraryDefaultContent, LibrarySection,
} from "./manual-sections";
import type { SectionCodeMode } from "@/components/section-library/dynamic-renderer";

export const ADMIN_SECTIONS_FILE = "ADMIN_SECTIONS.json";

export type SectionSourceType = "admin" | "user" | "built-in" | "custom" | "forked" | "ai-draft";
export type SectionVisibility = "admin-only" | "public" | "private";

export interface DynamicSectionDef {
  id: string;
  name: string;
  slug: string;
  category: SectionLibraryCategory;
  layoutType: string;
  description: string;
  tags: string[];
  /** admin (global library) vs user (personal). */
  sourceType: SectionSourceType;
  /** public | admin-only | private. */
  visibility: SectionVisibility;
  /** User id of the creator — drives edit/delete ownership checks. */
  createdByUserId?: string | null;
  version: number;
  /** Component source. TSX for "react" mode, HTML (with {{tokens}}) for "html". */
  componentCode: string;
  codeMode: SectionCodeMode;
  defaultContent: LibraryDefaultContent;
  editableFields: string[];
  /** Originality rule the admin certifies (never copy a referenced design). */
  originalityRule: string;
  status: SectionLibraryStatus;
  /** Recent code snapshots (newest first, capped) for revert in the Studio. */
  history?: { code: string; at: string }[];
  createdAt: string;
  updatedAt: string;
}

/** Max code snapshots kept per section for the Studio's version history. */
export const SECTION_HISTORY_CAP = 10;

export interface AdminSectionsFile {
  sections: DynamicSectionDef[];
  updatedAt?: string;
}

export function parseAdminSections(raw?: string | null): AdminSectionsFile {
  if (!raw) return { sections: [] };
  try {
    const o = JSON.parse(raw) as Partial<AdminSectionsFile>;
    return { sections: Array.isArray(o.sections) ? o.sections : [], updatedAt: o.updatedAt };
  } catch {
    return { sections: [] };
  }
}

/** Adapt an admin definition into the LibrarySection shape the browser renders. */
export function dynamicToLibrarySection(def: DynamicSectionDef): LibrarySection {
  return {
    id: def.id,
    name: def.name,
    category: def.category,
    layoutType: def.layoutType,
    description: def.description,
    tags: def.tags,
    componentName: def.name.replace(/\s+/g, ""),
    previewType: "component",
    editable: true,
    responsive: true,
    status: def.status,
    defaultContent: def.defaultContent,
    editableFields: def.editableFields,
    createdAt: def.createdAt,
    updatedAt: def.updatedAt,
    // Catalog fields are placeholders — dynamic sections render via code, not
    // the catalog registry.
    kind: "generic",
    sectionType: "features",
    variant: "custom",
    canvasName: def.name,
    // Component-based render wiring.
    componentCode: def.componentCode,
    codeMode: def.codeMode,
    origin: "catalog",
    sourceType: def.sourceType,
    createdByUserId: def.createdByUserId ?? null,
  };
}

/** Starter TSX shown when an admin creates a new section. */
export const STARTER_SECTION_CODE = `// Props you receive:
//   content : { eyebrow, title, subtitle, description,
//               primaryButtonLabel, secondaryButtonLabel, items }
//   theme   : brand tokens (accentColor, backgroundColor, textColor,
//             mutedTextColor, borderColor, radius, headingFont, bodyFont)
//
// Return any responsive React. Only "react" and "framer-motion" can be imported.

export default function Section({ content, theme }) {
  return (
    <section
      style={{
        background: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.bodyFont,
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      {content.eyebrow ? (
        <p style={{ color: theme.accentColor, fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
          {content.eyebrow}
        </p>
      ) : null}
      <h2 style={{ fontFamily: theme.headingFont, fontSize: 44, fontWeight: 800, margin: "12px 0", lineHeight: 1.1 }}>
        {content.title}
      </h2>
      <p style={{ color: theme.mutedTextColor, maxWidth: 560, margin: "0 auto", fontSize: 17, lineHeight: 1.6 }}>
        {content.description}
      </p>
      <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {content.primaryButtonLabel ? (
          <button style={{ background: theme.accentColor, color: "#fff", padding: "12px 24px", borderRadius: theme.radius, border: 0, fontWeight: 600, fontSize: 15 }}>
            {content.primaryButtonLabel}
          </button>
        ) : null}
        {content.secondaryButtonLabel ? (
          <button style={{ background: "transparent", color: theme.textColor, padding: "12px 24px", borderRadius: theme.radius, border: "1px solid " + theme.borderColor, fontWeight: 600, fontSize: 15 }}>
            {content.secondaryButtonLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
`;

/** Clean, near-empty scaffold for a NEW section — opens a blank editor. */
export const BLANK_SECTION_CODE = `// New section. Props: content, theme.
//   content : { eyebrow, title, subtitle, description, primaryButtonLabel,
//               secondaryButtonLabel, items }
//   theme   : { accentColor, backgroundColor, textColor, mutedTextColor,
//               borderColor, radius, headingFont, bodyFont }
// Only "react" and "framer-motion" can be imported.

export default function Section({ content, theme }) {
  return (
    <section style={{ background: theme.backgroundColor, color: theme.textColor, fontFamily: theme.bodyFont, padding: "80px 24px" }}>
      {/* Start building — e.g. <h2>{content.title}</h2> */}
    </section>
  );
}
`;

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";

export function newDynamicSectionDraft(): DynamicSectionDef {
  const now = new Date().toISOString();
  return {
    id: `adm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: "Untitled section",
    slug: "",
    sourceType: "custom",
    visibility: "public",
    version: 1,
    category: "custom",
    layoutType: "custom",
    description: "",
    tags: [],
    componentCode: BLANK_SECTION_CODE,
    codeMode: "react",
    defaultContent: {
      eyebrow: "New section",
      title: "A headline for your section",
      description: "Supporting copy that explains the value in one or two lines.",
      primaryButtonLabel: "Get started",
      secondaryButtonLabel: "Learn more",
    },
    editableFields: ["eyebrow", "title", "description", "primaryButtonLabel", "secondaryButtonLabel"],
    originalityRule: "Original design — not a copy of any referenced screenshot.",
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}
