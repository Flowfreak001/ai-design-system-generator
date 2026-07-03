"use client";

// Render a section from the registry given { type, variant, content, theme }.
// Falls back safely: missing variant → default variant; invalid variant →
// default; unknown type → a clean "unsupported" placeholder.

import type { SectionProps, SectionType, SectionTheme } from "./types";
import { getSectionComponent } from "./registry";
import { sectionTypeForKind, resolveVariantMeta } from "./catalog";
import { resolveTheme } from "./section-theme";

export function RenderSection(props: SectionProps) {
  const type = props.type;
  if (!type) return <UnsupportedSection label="Missing section type" theme={props.theme} />;
  const Comp = getSectionComponent(type, props.variant);
  if (!Comp) return <UnsupportedSection label={`Unsupported section type: ${type}`} theme={props.theme} />;
  return <Comp {...props} />;
}

export function renderSection(section: SectionProps) {
  return <RenderSection {...section} />;
}

/**
 * Editor bridge: render a section from the editor's inferred `kind`
 * (navbar/hero/services/...) + chosen variant id, mapping to the library.
 * TODO(editor): call this from the design canvas for each section.
 */
export function renderSectionByKind(
  kind: string,
  variantId: string | undefined,
  props: {
    name?: string; note?: string; theme?: SectionTheme; mobile?: boolean; assetSide?: "left" | "right"; hidden?: string[];
    onEditText?: (field: "title" | "description", value: string) => void;
    iconKey?: string; imageUrl?: string; onEditIcon?: (k: string) => void; onEditImage?: (v: string) => void;
  },
) {
  const type = sectionTypeForKind(kind);
  const meta = resolveVariantMeta(type, variantId);
  return (
    <RenderSection
      type={type}
      variant={meta?.id}
      title={props.name}
      description={props.note}
      theme={props.theme}
      mobile={props.mobile}
      assetSide={props.assetSide}
      hidden={props.hidden}
      onEditText={props.onEditText}
      iconKey={props.iconKey}
      imageUrl={props.imageUrl}
      onEditIcon={props.onEditIcon}
      onEditImage={props.onEditImage}
    />
  );
}

function UnsupportedSection({ label, theme }: { label: string; theme?: SectionTheme }) {
  const t = resolveTheme(theme);
  return (
    <section className="px-8 py-12 text-center" style={{ background: t.surfaceColor }}>
      <p className="text-[13px] font-medium" style={{ color: t.mutedTextColor, fontFamily: t.bodyFont }}>{label}</p>
      <p className="mt-1 text-[11.5px]" style={{ color: t.mutedTextColor, opacity: 0.7 }}>This section type is not in the library yet (Phase 2).</p>
    </section>
  );
}
